package com.library.lbms.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.enums.TransactionStatus;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByCopy_CopyIdAndReturnDateIsNull(UUID copyId);

    boolean existsByCopy_CopyId(UUID copyId);

    List<Transaction> findByUser_UserId(UUID userId);

    long countByUser_UserIdAndReturnDateIsNull(UUID userId);

    List<Transaction> findByReturnDateIsNullAndDueDateBefore(LocalDateTime date);

    List<Transaction> findByStatusAndDueDateBefore(
            TransactionStatus status,
            LocalDateTime dueDate);

    // ============================
    // REPORT METHODS (NEW)
    // ============================

    @Query("""
           SELECT t.copy.book.title, COUNT(t)
           FROM Transaction t
           GROUP BY t.copy.book.title
           ORDER BY COUNT(t) DESC
           """)
    List<Object[]> findTopBorrowedBooks(Pageable pageable);

    @Query("""
           SELECT t.user.email, COUNT(t)
           FROM Transaction t
           GROUP BY t.user.email
           ORDER BY COUNT(t) DESC
           """)
    List<Object[]> findMostActiveUsers(Pageable pageable);

    long countByStatus(TransactionStatus status);
}