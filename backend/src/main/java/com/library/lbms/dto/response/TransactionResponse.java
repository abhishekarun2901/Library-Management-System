package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal; // Import this
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TransactionResponse {
    private UUID transactionId;
    private UUID user_id;
    private UUID copy_id;
    private LocalDateTime checkout_date;
    private LocalDateTime return_date;
    private String status; 
    private BigDecimal estimatedFine;
}