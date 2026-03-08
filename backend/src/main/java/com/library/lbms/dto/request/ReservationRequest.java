package com.library.lbms.dto.request;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Book ID is required")
    private UUID bookId;

    /**
     * Optional future pickup date. When provided the reservation activates
     * 1 day before (reserved_at = pickupDate - 1 day) and expires 1 day after
     * the pickup date. When omitted, the reservation is immediate (active now,
     * expires in 24 hours).
     */
    private LocalDate pickupDate;
}