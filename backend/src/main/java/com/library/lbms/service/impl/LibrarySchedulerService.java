package com.library.lbms.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.enums.TransactionStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LibrarySchedulerService {

    private final TransactionRepository transactionRepository;

    // Runs daily at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void autoMarkOverdue() {

        List<Transaction> overdue =
                transactionRepository.findByStatusAndDueDateBefore(
                        TransactionStatus.issued,
                        LocalDateTime.now());

        for (Transaction tx : overdue) {
            tx.setStatus(TransactionStatus.overdue);
        }

        transactionRepository.saveAll(overdue);
    }
}