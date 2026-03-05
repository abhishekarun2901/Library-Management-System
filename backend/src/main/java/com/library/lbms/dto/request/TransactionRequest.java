package com.library.lbms.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class TransactionRequest {
    private UUID userId;
    private UUID copyId;
    private String status; 
}