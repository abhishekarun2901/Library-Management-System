package com.library.lbms.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReservationResponse {
    private UUID reservationId;
    private UUID userId;
    private UUID bookId;
    private String bookTitle;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;
    private LocalDate pickupDate;
    private String status;
    /** Position in the active reservation queue for this book (1 = next to be served). */
    private Integer queuePosition;
}