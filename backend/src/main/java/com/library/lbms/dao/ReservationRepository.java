package com.library.lbms.dao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.library.lbms.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByUser_UserId(UUID userId);
    
    boolean existsByUser_UserIdAndBook_BookIdAndStatus(UUID userId, UUID bookId, String status);

    long countByUser_UserIdAndStatus(UUID userId, String status);

    long countByBook_BookIdAndStatus(UUID bookId, String status);

    List<Reservation> findByStatusAndExpiresAtBefore(String status, LocalDateTime time);

    List<Reservation> findByBook_BookIdAndStatus(UUID bookId, String status);
}