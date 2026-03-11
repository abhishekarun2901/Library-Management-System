package com.library.lbms.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID; // Import this

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionResponse {
    private UUID transactionId;
    private UUID user_id;
    private UUID copy_id;
    private String bookTitle;
    private String memberName;
    private LocalDateTime checkout_date;
    private LocalDateTime due_date;
    private LocalDateTime return_date;
    private String status;
    private BigDecimal estimatedFine;
}