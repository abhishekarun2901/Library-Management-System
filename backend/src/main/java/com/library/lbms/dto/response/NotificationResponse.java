package com.library.lbms.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {
    private UUID notificationId;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}