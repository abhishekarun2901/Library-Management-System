package com.library.lbms.dao;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.library.lbms.entity.Fine;

public interface FineRepository extends JpaRepository<Fine, UUID> {

    Optional<Fine> findByTransaction_TransactionId(UUID transactionId);

    List<Fine> findByUser_UserId(UUID userId);

    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.paid = true")
    BigDecimal sumPaidFines();

    @Query("SELECT SUM(f.amount) FROM Fine f WHERE f.paid = false")
    BigDecimal sumOutstandingFines();
}