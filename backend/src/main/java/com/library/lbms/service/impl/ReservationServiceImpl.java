package com.library.lbms.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
            throw new BadRequestException("Invalid reservation status: must be one of " + ALLOWED_RESERVATION_STATUSES);
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

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Reservation failed: your account is currently inactive or restricted.");
        }

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (!Boolean.TRUE.equals(book.getIsActive())) {
            throw new BadRequestException("Reservation failed: this book is no longer available in the catalog.");
        }

        // AC-1: Reservation requires at least one AVAILABLE copy.
        boolean hasAvailableCopy = book.getCopies().stream()
                .anyMatch(copy -> copy.getStatus() == CopyStatus.AVAILABLE);

        if (!hasAvailableCopy) {
            throw new BadRequestException("No available copies for this book. Cannot create reservation.");
        }

        // Max 3 active reservations per user
        long activeCount = reservationRepository.countByUser_UserIdAndStatus(user.getUserId(), "active");
        if (activeCount >= 3) {
            throw new BadRequestException("You have reached the maximum limit of 3 active reservations.");
        }

        // Prevent duplicate active reservation for the same book
        if (reservationRepository.existsByUser_UserIdAndBook_BookIdAndStatus(
                user.getUserId(), book.getBookId(), "active")) {
            throw new BadRequestException("You already have an active reservation for this book.");
        }

        // AC-2: pickupDate handling.
        // When pickupDate is provided: reserved_at = pickupDate - 1 day (so the
        // hold activates just-in-time), expires_at = pickupDate + 1 day (2-day
        // collection window). When absent: immediate 24-hour reservation.
        LocalDate pickupDate = request.getPickupDate();
        LocalDateTime reservedAt;
        LocalDateTime expiresAt;

        if (pickupDate != null) {
            if (pickupDate.isBefore(LocalDate.now().plusDays(1))) {
                throw new BadRequestException("pickupDate must be at least tomorrow.");
            }
            reservedAt = pickupDate.minusDays(1).atStartOfDay();
            expiresAt  = pickupDate.plusDays(1).atTime(23, 59, 59);
        } else {
            reservedAt = LocalDateTime.now();
            expiresAt  = LocalDate.now().plusDays(1).atStartOfDay();
        }

        Reservation reservation = Reservation.builder()
                .reservationId(UUID.randomUUID())
                .user(user)
                .book(book)
                .reservedAt(reservedAt)
                .expiresAt(expiresAt)
                .status("active")
                .build();

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
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

    // ── Mapper ────────────────────────────────────────────────────────────────

    private ReservationResponse mapToResponse(Reservation reservation) {
        // Compute queue position among active reservations for this book (FIFO)
        Integer queuePosition = null;
        if ("active".equals(reservation.getStatus())) {
            List<Reservation> queue = reservationRepository
                    .findByBook_BookIdAndStatus(reservation.getBook().getBookId(), "active")
                    .stream()
                    .sorted(Comparator.comparing(Reservation::getReservedAt))
                    .collect(Collectors.toList());

            queuePosition = IntStream.range(0, queue.size())
                    .filter(i -> queue.get(i).getReservationId().equals(reservation.getReservationId()))
                    .map(i -> i + 1)
                    .boxed()
                    .findFirst()
                    .orElse(null);
        }

        // Derive pickupDate from expiresAt when it was a scheduled reservation
        // (expiresAt is always set to pickupDate + 1 day for scheduled ones)
        LocalDate pickupDate = null;
        if (reservation.getExpiresAt() != null) {
            LocalDate expiryDate = reservation.getExpiresAt().toLocalDate();
            // Heuristic: if expiresAt - reservedAt > 25 hours it was a scheduled reservation
            long hoursBetween = java.time.Duration.between(
                    reservation.getReservedAt(), reservation.getExpiresAt()).toHours();
            if (hoursBetween > 25) {
                pickupDate = expiryDate.minusDays(1);
            }
        }

        return ReservationResponse.builder()
                .reservationId(reservation.getReservationId())
                .userId(reservation.getUser().getUserId())
                .bookId(reservation.getBook().getBookId())
                .bookTitle(reservation.getBook().getTitle())
                .reservedAt(reservation.getReservedAt())
                .expiresAt(reservation.getExpiresAt())
                .pickupDate(pickupDate)
                .status(reservation.getStatus())
                .queuePosition(queuePosition)
                .build();
    }
}

