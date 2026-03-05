package com.library.lbms.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.response.FineResponse;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.User;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.FineService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final UserRepository userRepository;

    @Override
    public List<FineResponse> getAllFines() {
        return fineRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FineResponse> getUserFines(UUID userId) {
        return fineRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Interface requires void payFine(UUID transactionId)
     */
    @Override
    @Transactional
    public void payFine(UUID transactionId) {

        Fine fine = fineRepository.findByTransaction_TransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found for transaction"));

        if (Boolean.TRUE.equals(fine.getPaid())) {
            return; // already paid
        }

        fine.setPaid(true);
        fineRepository.save(fine);

        // Update user audit
        User user = fine.getUser();
        if (user != null) {
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    private FineResponse mapToResponse(Fine fine) {
        return FineResponse.builder()
                .fineId(fine.getFineId())
                .transactionId(fine.getTransaction().getTransactionId())
                .amount(fine.getAmount())
                .reason(fine.getReason())
                .issuedAt(fine.getIssuedAt())
                .paid(fine.getPaid())
                .build();
    }
}