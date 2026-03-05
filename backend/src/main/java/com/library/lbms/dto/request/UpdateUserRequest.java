package com.library.lbms.dto.request;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String fullName;
    private Boolean isActive;
    private String blacklistReason;
}