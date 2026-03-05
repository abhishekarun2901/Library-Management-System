package com.library.lbms.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.NotificationRepository;
import com.library.lbms.dao.ReservationRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.Notification;
import com.library.lbms.entity.Reservation;
import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.TransactionStatus;
import com.library.lbms.service.MaintenanceService;

import jakarta.transaction.Transactional;

@Component
@Transactional
public class MaintenanceServiceImpl implements MaintenanceService{
    private final TransactionRepository transactionRepository;
    private final FineRepository fineRepository;
    private final ReservationRepository reservationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Value("${lbms.fine.perday:2}")
    private BigDecimal finePerDay;

    public MaintenanceServiceImpl(TransactionRepository transactionRepository,
                                FineRepository fineRepository,
                                ReservationRepository reservationRepository,
                                NotificationRepository notificationRepository,
                                UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.fineRepository = fineRepository;
        this.reservationRepository = reservationRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    //Runs daily at midnight (00:00)

    @Override
    @Scheduled(cron = "0 0 0 * * ?")
    public void runDailyMaintenance() {

        expireReservations();
        processOverdueFines();
        blacklistLongOverdueUsers();
    }

    //Expire Reservations
    @Override
    public void expireReservations() {

        LocalDateTime now = LocalDateTime.now();

        List<Reservation> expiredReservations =
                reservationRepository.findByStatusAndExpiresAtBefore(
                "active", now);

        if (expiredReservations.isEmpty()) return;

        for (Reservation reservation : expiredReservations) {
            reservation.setStatus("expired");
        }

        reservationRepository.saveAll(expiredReservations);
    }

    //Fine Calculation
    @Override
    public void processOverdueFines() {

        LocalDateTime now = LocalDateTime.now();

        List<Transaction> overdueTransactions =
                transactionRepository.findByReturnDateIsNullAndDueDateBefore(now);

        for (Transaction transaction : overdueTransactions) {
            if (transaction.getStatus() == TransactionStatus.returned
                    || transaction.getStatus() == TransactionStatus.lost) {
                continue;
            }

            boolean newlyOverdue = transaction.getStatus() != TransactionStatus.overdue;

            if (transaction.getStatus() == TransactionStatus.issued) {
                transaction.setStatus(TransactionStatus.overdue);
            }

            long daysOverdue =
                    ChronoUnit.DAYS.between(
                            transaction.getDueDate().toLocalDate(),
                            now.toLocalDate());

            if (daysOverdue <= 0) continue;

            BigDecimal fineAmount =
                    finePerDay.multiply(BigDecimal.valueOf(daysOverdue));

            Optional<Fine> existingFine =
                    fineRepository.findByTransaction_TransactionId(
                            transaction.getTransactionId());

            if (existingFine.isPresent()) {

                Fine fine = existingFine.get();
                if (Boolean.TRUE.equals(fine.getPaid())) continue;

                fine.setAmount(fineAmount);
                fine.setReason("Overdue fine: " + daysOverdue + " days");
                fine.setIssuedAt(LocalDateTime.now());
                fineRepository.save(fine);

            } else {

                Fine fine = new Fine();
                fine.setTransaction(transaction);
                fine.setUser(transaction.getUser());
                fine.setAmount(fineAmount);
                fine.setReason("Overdue fine: " + daysOverdue + " days");
                fine.setIssuedAt(LocalDateTime.now());
                fine.setPaid(false);

                fineRepository.save(fine);
            }

            if (newlyOverdue) {
                notificationRepository.save(Notification.builder()
                        .notificationId(UUID.randomUUID())
                        .user(transaction.getUser())
                        .type("OVERDUE")
                        .message("Book is overdue by " + daysOverdue + " day(s). Please return it.")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            transactionRepository.save(transaction);
        }
    }

    //Blacklist Users (>30 Days Overdue)
    @Override
    public void blacklistLongOverdueUsers() {

        LocalDate thresholdDate = LocalDate.now().minusDays(30);
        LocalDateTime thresholdDateTime = thresholdDate.atStartOfDay();

        List<Transaction> longOverdueTransactions =
                transactionRepository.findByReturnDateIsNullAndDueDateBefore(thresholdDateTime);

        Set<User> usersToBlacklist = new HashSet<>();

        for (Transaction transaction : longOverdueTransactions) {

            User user = transaction.getUser();

            if (user != null && Boolean.TRUE.equals(user.getIsActive())) {
                usersToBlacklist.add(user);
            }
        }

        for (User user : usersToBlacklist) {
            user.setIsActive(false);
            user.setBlacklistReason("Auto-blacklisted: overdue > 30 days");
        }

        userRepository.saveAll(usersToBlacklist);
    }
}
