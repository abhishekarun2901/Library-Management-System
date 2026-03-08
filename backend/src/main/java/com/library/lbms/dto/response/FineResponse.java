package com.library.lbms.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FineResponse {
    private UUID fineId;
    private UUID transactionId;
    private String bookTitle;
    private String memberName;
    private BigDecimal amount;
    private String reason;
    private LocalDateTime issuedAt;
    private Boolean paid;
}