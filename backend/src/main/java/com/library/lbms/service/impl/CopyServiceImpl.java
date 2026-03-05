package com.library.lbms.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.library.lbms.dao.BookRepository;
import com.library.lbms.dao.CopyRepository;
import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.ReservationRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.request.CopyRequest;
import com.library.lbms.dto.response.CopyResponse;
import com.library.lbms.entity.Book;
import com.library.lbms.entity.Copy;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.Reservation;
import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.CopyStatus;
import com.library.lbms.entity.enums.TransactionStatus;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.CopyService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CopyServiceImpl implements CopyService {

    private final CopyRepository copyRepository;
    private final TransactionRepository transactionRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;

    @Override
    @Transactional
    public CopyResponse createCopy(UUID bookId, CopyRequest request) {

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Copy copy = Copy.builder()
                .book(book)
                .status(CopyStatus.AVAILABLE)
                .build();

        copyRepository.save(copy);

        return CopyResponse.builder()
                .copyId(copy.getCopyId())
                .bookId(book.getBookId())
                .status(copy.getStatus().name())
                .build();
    }    

        // GET COPIES BY BOOK ID (REQUIRED BY INTERFACE)
          @Override
        @Transactional(readOnly = true)
        public List<CopyResponse> getCopiesByBookId(UUID bookId) {

        // Ensure book exists
        bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        List<Copy> copies = copyRepository.findByBook_BookId(bookId);

        return copies.stream()
                .map(copy -> CopyResponse.builder()
                        .copyId(copy.getCopyId())
                        .bookId(copy.getBook().getBookId())
                        .status(copy.getStatus().name())
                        .build())
                .toList();
        }

    // ISSUE COPY
    @Override
    @Transactional
    public void issueCopy(UUID copyId, UUID memberId) {

        Copy copy = copyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found"));

        User user = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (copy.getStatus() != CopyStatus.AVAILABLE) {
            throw new BadRequestException("Copy is not available");
        }

        if (transactionRepository.findByCopy_CopyIdAndReturnDateIsNull(copyId).isPresent()) {
            throw new BadRequestException("Copy already has an active transaction");
        }

        // Block if unpaid fines
        boolean hasUnpaidFines = fineRepository
                .findByUser_UserId(memberId)
                .stream()
                .anyMatch(f -> !Boolean.TRUE.equals(f.getPaid()));

        if (hasUnpaidFines) {
            throw new BadRequestException("Cannot borrow: unpaid fines exist");
        }

        // Reservation FIFO enforcement
        List<Reservation> reservations =
                reservationRepository.findByBook_BookIdAndStatus(
                        copy.getBook().getBookId(),
                        "active");

        if (!reservations.isEmpty()) {

            Reservation firstReservation =
                    reservations.stream()
                            .sorted(Comparator.comparing(Reservation::getReservedAt))
                            .findFirst()
                            .orElse(null);

            if (firstReservation != null &&
                    !firstReservation.getUser().getUserId().equals(memberId)) {
                throw new BadRequestException(
                        "Book reserved by another user");
            }

            if (firstReservation != null) {
                firstReservation.setStatus("fulfilled");
                reservationRepository.save(firstReservation);
            }
        }

        copy.setStatus(CopyStatus.ISSUED);

        Transaction transaction = Transaction.builder()
                .transactionId(UUID.randomUUID())
                .copy(copy)
                .user(user)
                .issueDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(14))
                .status(TransactionStatus.issued)
                .build();

        user.setUpdatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

    // RETURN COPY
    @Override
    @Transactional
    public void returnCopy(UUID copyId) {

        Transaction transaction =
                transactionRepository
                        .findByCopy_CopyIdAndReturnDateIsNull(copyId)
                        .orElseThrow(() -> new BadRequestException("No active transaction found"));

        transaction.setReturnDate(LocalDateTime.now());
        transaction.setStatus(TransactionStatus.returned);
        transaction.getCopy().setStatus(CopyStatus.AVAILABLE);

        if (transaction.getReturnDate().isAfter(transaction.getDueDate())) {

            long daysLate = ChronoUnit.DAYS.between(
                    transaction.getDueDate(),
                    transaction.getReturnDate());

            if (daysLate > 0) {
                var existingFine = fineRepository.findByTransaction_TransactionId(transaction.getTransactionId());
                if (existingFine.isPresent()) {
                    Fine fine = existingFine.get();
                    if (!Boolean.TRUE.equals(fine.getPaid())) {
                        fine.setAmount(BigDecimal.valueOf(daysLate * 2.0));
                        fine.setReason("Overdue fine");
                        fine.setIssuedAt(LocalDateTime.now());
                        fineRepository.save(fine);
                    }
                } else {
                    Fine fine = Fine.builder()
                            .transaction(transaction)
                            .user(transaction.getUser())
                            .amount(BigDecimal.valueOf(daysLate * 2.0))
                            .reason("Overdue fine")
                            .issuedAt(LocalDateTime.now())
                            .paid(false)
                            .build();

                    fineRepository.save(fine);
                }
            }
        }

        transaction.getUser().setUpdatedAt(LocalDateTime.now());
    }

    // MARK LOST
    @Override
    @Transactional
    public void markLost(UUID copyId) {

        Transaction transaction =
                transactionRepository
                        .findByCopy_CopyIdAndReturnDateIsNull(copyId)
                        .orElseThrow(() -> new BadRequestException("No active transaction found"));

        transaction.setReturnDate(LocalDateTime.now());
        transaction.setStatus(TransactionStatus.lost);
        transaction.getCopy().setStatus(CopyStatus.LOST);

        var existingFine = fineRepository.findByTransaction_TransactionId(transaction.getTransactionId());
        if (existingFine.isPresent()) {
            Fine fine = existingFine.get();
            if (!Boolean.TRUE.equals(fine.getPaid())) {
                fine.setAmount(BigDecimal.valueOf(50));
                fine.setReason("Lost book penalty");
                fine.setIssuedAt(LocalDateTime.now());
                fineRepository.save(fine);
            }
        } else {
            Fine fine = Fine.builder()
                    .transaction(transaction)
                    .user(transaction.getUser())
                    .amount(BigDecimal.valueOf(50))
                    .reason("Lost book penalty")
                    .issuedAt(LocalDateTime.now())
                    .paid(false)
                    .build();

            fineRepository.save(fine);
        }

        transaction.getUser().setUpdatedAt(LocalDateTime.now());
    }

    // UPDATE COPY STATUS 
    @Override
    @Transactional
    public CopyResponse updateCopyStatus(UUID copyId, CopyRequest request) {

        Copy copy = copyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found"));

        if (request.getStatus() == null) {
            throw new BadRequestException("Status cannot be null");
        }

        try {
            CopyStatus newStatus =
                    CopyStatus.valueOf(request.getStatus().toUpperCase());

            copy.setStatus(newStatus);
            copyRepository.save(copy);

        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid copy status");
        }

        return CopyResponse.builder()
                .copyId(copy.getCopyId())
                .bookId(copy.getBook().getBookId())
                .status(copy.getStatus().name())
                .build();
    }

    // DELETE COPY (SOFT DELETE VIA LOST)
    @Override
    @Transactional
    public void deleteCopy(UUID copyId) {

        Copy copy = copyRepository.findById(copyId)
                .orElseThrow(() -> new ResourceNotFoundException("Copy not found"));

        boolean hasActiveTransaction =
                transactionRepository
                        .findByCopy_CopyIdAndReturnDateIsNull(copyId)
                        .isPresent();

        if (hasActiveTransaction) {
            throw new BadRequestException(
                    "Cannot delete copy with active transaction");
        }

        copy.setStatus(CopyStatus.LOST);
        copyRepository.save(copy);
    }

}
