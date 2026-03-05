package com.library.lbms.service;

import com.library.lbms.dto.response.FineResponse;
import java.util.List;
import java.util.UUID;

public interface FineService {
    List<FineResponse> getAllFines();
    List<FineResponse> getUserFines(UUID userId);
    void payFine(UUID transactionId); // Changed to match controller usage
}