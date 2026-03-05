package com.library.lbms.dto.request;

import lombok.Data;

@Data
public class CopyRequest {
    private String status; // "AVAILABLE", "MAINTENANCE", etc.
}