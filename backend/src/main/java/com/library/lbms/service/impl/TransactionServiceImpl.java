package com.library.lbms.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.library.lbms.dao.CopyRepository;
import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.NotificationRepository;
import com.library.lbms.dao.ReservationRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.request.TransactionRequest;
import com.library.lbms.dto.response.TransactionResponse;
import com.library.lbms.entity.Copy;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.Notification;
import com.library.lbms.entity.Reservation;
import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.CopyStatus;
import com.library.lbms.entity.enums.TransactionStatus;
import com.library.lbms.entity.enums.UserRole;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CopyRepository copyRepository;
    private final FineRepository fineRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;

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

    @Override
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<TransactionResponse> getUserTransactions(UUID userId) {
        return transactionRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ISSUE BOOK
    @Override
    @Transactional
    public TransactionResponse issueBook(TransactionRequest request) {
        User requester = getAuthenticatedUser();
        boolean admin = isAdmin(requester);

        if (!admin) {
            throw new AccessDeniedException("Only admins can issue books.");
        }

        UUID userId = request.getUserId() != null ? request.getUserId() : requester.getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.member) {
            throw new BadRequestException("Books can only be issued to members.");
        }

        Copy copy = copyRepository.findById(request.getCopyId())
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("User is inactive or blacklisted.");
        }

        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new BadRequestException("Copy unavailable.");
        }

        if (transactionRepository.findByCopy_CopyIdAndReturnDateIsNull(copy.getCopyId()).isPresent()) {
            throw new BadRequestException("Copy already has an active transaction.");
        }

        boolean hasUnpaidFines = fineRepository
                .findByUser_UserId(user.getUserId())
                .stream()
                .anyMatch(f -> !Boolean.TRUE.equals(f.getPaid()));

        if (hasUnpaidFines)
            throw new BadRequestException("Outstanding unpaid fines exist.");

        List<Reservation> activeForBook =
                reservationRepository.findByBook_BookIdAndStatus(copy.getBook().getBookId(), "active")
                        .stream()
                        .sorted(Comparator.comparing(Reservation::getReservedAt))
                        .toList();

        if (!activeForBook.isEmpty()) {
            Reservation first = activeForBook.get(0);

            if (!first.getUser().getUserId().equals(user.getUserId())) {
                throw new BadRequestException("Book reserved by another member.");
            }

            first.setStatus("fulfilled");
            reservationRepository.save(first);
        }

        copy.setStatus(CopyStatus.ISSUED);

        Transaction tx = Transaction.builder()
                .transactionId(UUID.randomUUID())
                .copy(copy)
                .user(user)
                .issueDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(14))
                .status(TransactionStatus.issued)
                .build();

        user.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(transactionRepository.save(tx));
    }

    // UPDATE (Return)
    @Override
    @Transactional
    public TransactionResponse updateTransaction(UUID transactionId, TransactionRequest request) {
        User requester = getAuthenticatedUser();
        boolean admin = isAdmin(requester);

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!admin && !tx.getUser().getUserId().equals(requester.getUserId())) {
            throw new BadRequestException("Members can only update their own transactions.");
        }

        if (tx.getReturnDate() != null) {
            throw new BadRequestException("Transaction is already closed.");
        }

        String targetStatus = (request != null && request.getStatus() != null)
                ? request.getStatus().trim().toUpperCase()
                : "RETURNED";

        LocalDateTime now = LocalDateTime.now();

        switch (targetStatus) {
            case "RETURNED" -> {
                tx.setReturnDate(now);
                tx.setStatus(TransactionStatus.returned);
                tx.getCopy().setStatus(CopyStatus.AVAILABLE);
                applyOverdueFineIfNeeded(tx, now);
                notifyNextReservationIfAny(tx.getCopy());
            }
            case "LOST" -> {
                tx.setReturnDate(now);
                tx.setStatus(TransactionStatus.lost);
                tx.getCopy().setStatus(CopyStatus.LOST);
                applyLostPenalty(tx, now);
            }
            default -> throw new BadRequestException("Only RETURNED or LOST status is supported.");
        }

        tx.getUser().setUpdatedAt(now);

        return mapToResponse(transactionRepository.save(tx));
    }

    private void applyOverdueFineIfNeeded(Transaction tx, LocalDateTime returnTime) {
        if (!returnTime.isAfter(tx.getDueDate())) {
            return;
        }

        long daysLate = ChronoUnit.DAYS.between(tx.getDueDate().toLocalDate(), returnTime.toLocalDate());
        if (daysLate <= 0) {
            return;
        }

        BigDecimal amount = BigDecimal.valueOf(daysLate * 2L);
        Optional<Fine> existingFine = fineRepository.findByTransaction_TransactionId(tx.getTransactionId());

        if (existingFine.isPresent()) {
            Fine fine = existingFine.get();
            if (Boolean.TRUE.equals(fine.getPaid())) {
                return;
            }
            fine.setAmount(amount);
            fine.setReason("Overdue fine: " + daysLate + " days");
            fine.setIssuedAt(returnTime);
            fineRepository.save(fine);
            return;
        }

        fineRepository.save(Fine.builder()
                .transaction(tx)
                .user(tx.getUser())
                .amount(amount)
                .reason("Overdue fine: " + daysLate + " days")
                .issuedAt(returnTime)
                .paid(false)
                .build());
    }

    private void applyLostPenalty(Transaction tx, LocalDateTime eventTime) {
        Optional<Fine> existingFine = fineRepository.findByTransaction_TransactionId(tx.getTransactionId());

        if (existingFine.isPresent()) {
            Fine fine = existingFine.get();
            if (Boolean.TRUE.equals(fine.getPaid())) {
                return;
            }
            fine.setAmount(BigDecimal.valueOf(50));
            fine.setReason("Lost book penalty");
            fine.setIssuedAt(eventTime);
            fineRepository.save(fine);
            return;
        }

        fineRepository.save(Fine.builder()
                .transaction(tx)
                .user(tx.getUser())
                .amount(BigDecimal.valueOf(50))
                .reason("Lost book penalty")
                .issuedAt(eventTime)
                .paid(false)
                .build());
    }

    private void notifyNextReservationIfAny(Copy copy) {
        List<Reservation> activeReservations = reservationRepository
                .findByBook_BookIdAndStatus(copy.getBook().getBookId(), "active")
                .stream()
                .sorted(Comparator.comparing(Reservation::getReservedAt))
                .toList();

        if (activeReservations.isEmpty()) {
            return;
        }

        Reservation first = activeReservations.get(0);
        notificationRepository.save(Notification.builder()
                .notificationId(UUID.randomUUID())
                .user(first.getUser())
                .type("RESERVATION_READY")
                .message("Reservation ready for: " + copy.getBook().getTitle())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .transactionId(t.getTransactionId())
                .user_id(t.getUser().getUserId())
                .copy_id(t.getCopy().getCopyId())
                .checkout_date(t.getIssueDate())
                .return_date(t.getReturnDate())
                .status(t.getStatus().name())
                .estimatedFine(null)
                .build();
    }
}
