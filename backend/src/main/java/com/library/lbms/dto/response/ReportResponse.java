package com.library.lbms.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReportResponse {

    private long totalInventory;
    private BigDecimal totalFineRevenue;
    private List<Map<String, Object>> topBorrowedBooks;
    private List<Map<String, Object>> mostActiveUsers;
    private BigDecimal totalOutstandingFines;
    private long overdueCount;
    private long lostCount;
}