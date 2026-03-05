package com.library.lbms.controller;

import com.library.lbms.dto.request.ReservationRequest;
import com.library.lbms.dto.response.ReservationResponse;
import com.library.lbms.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/reservations") 
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.createReservation(request));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getUserReservations(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(reservationService.getUserReservations(userId));
    }

    @PatchMapping("/{reservationId}")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable UUID reservationId,
            @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(reservationId, status));
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> cancelReservation(@PathVariable UUID reservationId) {
        reservationService.cancelReservation(reservationId);
        return ResponseEntity.ok().build();
    }
}