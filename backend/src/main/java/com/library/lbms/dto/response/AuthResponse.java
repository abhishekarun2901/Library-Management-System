package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String userId;
    private String role;
    private String fullName;
    private String memberSince;
}