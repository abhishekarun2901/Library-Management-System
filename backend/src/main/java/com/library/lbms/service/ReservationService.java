package com.library.lbms.service;

import com.library.lbms.dto.request.ReservationRequest;
import com.library.lbms.dto.response.ReservationResponse;

import java.util.List;
import java.util.UUID;

public interface ReservationService {
    ReservationResponse createReservation(ReservationRequest request);
    List<ReservationResponse> getUserReservations(UUID userId);
    void cancelReservation(UUID reservationId);
    ReservationResponse updateReservationStatus(UUID reservationId, String status);
}