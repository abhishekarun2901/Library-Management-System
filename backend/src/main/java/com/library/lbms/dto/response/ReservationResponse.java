package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReservationResponse {
    private UUID reservationId;
    private String bookTitle;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;
    private String status;
}