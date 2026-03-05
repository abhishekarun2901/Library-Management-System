package com.library.lbms.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.library.lbms.dao.CopyRepository;
import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dto.response.ReportResponse;
import com.library.lbms.entity.enums.TransactionStatus;
import com.library.lbms.service.ReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final FineRepository fineRepository;
    private final CopyRepository copyRepository;

    @Override
    public ReportResponse getSystemAnalytics() {

        List<Map<String, Object>> topBooks =
                transactionRepository.findTopBorrowedBooks(PageRequest.of(0, 5))
                        .stream()
                        .map(obj -> Map.of(
                                "title", obj[0],
                                "borrowCount", obj[1]
                        ))
                        .toList();

        List<Map<String, Object>> activeUsers =
                transactionRepository.findMostActiveUsers(PageRequest.of(0, 5))
                        .stream()
                        .map(obj -> Map.of(
                                "email", obj[0],
                                "borrowCount", obj[1]
                        ))
                        .toList();

        BigDecimal revenue = fineRepository.sumPaidFines();
        BigDecimal outstanding = fineRepository.sumOutstandingFines();

        long overdueCount = transactionRepository.countByStatus(TransactionStatus.overdue);
        long lostCount = transactionRepository.countByStatus(TransactionStatus.lost);

        return ReportResponse.builder()
                .totalInventory(copyRepository.count())
                .totalFineRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .topBorrowedBooks(topBooks)
                .mostActiveUsers(activeUsers)
                .totalOutstandingFines(outstanding != null ? outstanding : BigDecimal.ZERO)
                .overdueCount(overdueCount)
                .lostCount(lostCount)
                .build();
    }
}
