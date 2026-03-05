package com.library.lbms.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.library.lbms.dao.BookRepository;
import com.library.lbms.dao.ReservationRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.request.ReservationRequest;
import com.library.lbms.dto.response.ReservationResponse;
import com.library.lbms.entity.Book;
import com.library.lbms.entity.Reservation;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.CopyStatus;
import com.library.lbms.entity.enums.UserRole;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.ReservationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private static final Set<String> ALLOWED_RESERVATION_STATUSES =
            Set.of("active", "expired", "fulfilled", "cancelled");

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new BadRequestException("No authenticated user");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.admin;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Reservation status is required");
        }

        String normalized = status.trim().toLowerCase();
        if (!ALLOWED_RESERVATION_STATUSES.contains(normalized)) {
            throw new BadRequestException("Invalid reservation status");
        }
        return normalized;
    }

    @Override
    @Transactional
    public ReservationResponse createReservation(ReservationRequest request) {
        User requester = getAuthenticatedUser();
        boolean admin = isAdmin(requester);

        if (!admin && !requester.getUserId().equals(request.getUserId())) {
            throw new BadRequestException("Members can only reserve books for themselves.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // NEW: Check if account is active
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Reservation failed: Your account is currently inactive or restricted.");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        // Enforce backend limit: Max 3 active reservations per user
        long activeReservationCount = reservationRepository.countByUser_UserIdAndStatus(user.getUserId(), "active");
        if (activeReservationCount >= 3) {
            throw new BadRequestException("You have reached the maximum limit of 3 active reservations.");
        }

        // Check for duplicate reservations for the same book
        if (reservationRepository.existsByUser_UserIdAndBook_BookIdAndStatus(user.getUserId(), book.getBookId(), "active")) {
            throw new BadRequestException("You already have an active reservation for this book.");
        }

        // Check if copy is already available (should issue instead)
        boolean isCopyAvailable = book.getCopies().stream()
                .anyMatch(copy -> copy.getStatus() == CopyStatus.AVAILABLE);

        if (isCopyAvailable) {
            throw new BadRequestException("Copies are currently available. Please issue the book directly.");
        }

        Reservation reservation = Reservation.builder()
                .reservationId(UUID.randomUUID())
                .user(user)
                .book(book)
                .reservedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusHours(24)) 
                .status("active")
                .build();

        return mapToResponse(reservationRepository.save(reservation));
    }

    @Override
    public List<ReservationResponse> getUserReservations(UUID userId) {
        User requester = getAuthenticatedUser();

        List<Reservation> reservations;
        if (isAdmin(requester)) {
            reservations = (userId == null)
                    ? reservationRepository.findAll()
                    : reservationRepository.findByUser_UserId(userId);
        } else {
            reservations = reservationRepository.findByUser_UserId(requester.getUserId());
        }

        return reservations.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelReservation(UUID reservationId) {
        User requester = getAuthenticatedUser();

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!isAdmin(requester) && !reservation.getUser().getUserId().equals(requester.getUserId())) {
            throw new BadRequestException("You can only cancel your own reservation.");
        }

        if (!"active".equals(reservation.getStatus())) {
            throw new BadRequestException("Only active reservations can be cancelled.");
        }

        reservation.setStatus("cancelled");
        reservationRepository.save(reservation);
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        return ReservationResponse.builder()
                .reservationId(reservation.getReservationId())
                .bookTitle(reservation.getBook().getTitle())
                .reservedAt(reservation.getReservedAt())
                .expiresAt(reservation.getExpiresAt())
                .status(reservation.getStatus())
                .build();
    }

    @Override
    @Transactional
    public ReservationResponse updateReservationStatus(UUID reservationId, String status) {
        User requester = getAuthenticatedUser();
        if (!isAdmin(requester)) {
            throw new BadRequestException("Only admins can update reservation status.");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        reservation.setStatus(normalizeStatus(status));
        reservationRepository.save(reservation);

        return mapToResponse(reservation);
    }
}
