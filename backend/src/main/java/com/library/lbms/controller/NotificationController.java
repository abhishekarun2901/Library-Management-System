package com.library.lbms.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.lbms.dao.NotificationRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.response.NotificationResponse;
import com.library.lbms.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email).orElseThrow();

        return ResponseEntity.ok(notificationRepository.findByUser_UserId(user.getUserId()).stream()
                .map(n -> NotificationResponse.builder()
                        .notificationId(n.getNotificationId())
                        .message(n.getMessage())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList()));
    }

    // Handles PATCH /v1/notifications/{id} to toggle isRead status
    @PatchMapping("/{notification_id}")
    public ResponseEntity<Void> updateNotificationStatus(
            @PathVariable("notification_id") UUID notification_id,
            Authentication authentication) {

        var notification = notificationRepository.findById(notification_id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        boolean admin = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!admin) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            var user = userRepository.findByEmail(email).orElseThrow();
            if (!notification.getUser().getUserId().equals(user.getUserId())) {
                throw new ResourceNotFoundException("Notification not found");
            }
        }

        notification.setIsRead(true); // Mark as read
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

    // POST /v1/notifications/{id}/mark-read — preferred endpoint for marking as read
    @org.springframework.web.bind.annotation.PostMapping("/{notification_id}/mark-read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("notification_id") UUID notification_id,
            Authentication authentication) {
        return updateNotificationStatus(notification_id, authentication);
    }
}
