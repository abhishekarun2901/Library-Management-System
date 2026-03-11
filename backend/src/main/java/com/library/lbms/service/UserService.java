package com.library.lbms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.library.lbms.dto.request.CreateUserRequest;
import com.library.lbms.dto.request.UpdateUserRequest;
import com.library.lbms.dto.response.FineResponse;
import com.library.lbms.dto.response.TransactionResponse;
import com.library.lbms.dto.response.UserResponse;

public interface UserService {

    Page<UserResponse> getAllUsers(Pageable pageable);
    Page<UserResponse> getAllUsers(String search, Pageable pageable);
    UserResponse updateUser(UUID userId, UpdateUserRequest request);
    void deleteUser(UUID userId);
    UserResponse createUser(CreateUserRequest request);
    UserResponse getCurrentUserProfile();
    List<TransactionResponse> getCurrentUserHistory();
    List<FineResponse> getCurrentUserFines();
    List<TransactionResponse> getUserHistory(UUID userId);
    List<FineResponse> getUserFines(UUID userId);
    void updateLastLogin(String email);
    String getFullNameByEmail(String email);
    java.time.LocalDateTime getCreatedAtByEmail(String email);
    java.util.UUID getUserIdByEmail(String email);
}
