package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {

    private UUID userId;
    private String email;
    private String fullName;
    private String role;
    private Boolean isActive;
    private String blacklistReason;
    private LocalDateTime createdAt;
}