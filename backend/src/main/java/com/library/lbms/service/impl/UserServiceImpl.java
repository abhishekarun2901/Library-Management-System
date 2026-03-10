package com.library.lbms.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.dto.request.CreateUserRequest;
import com.library.lbms.dto.request.UpdateUserRequest;
import com.library.lbms.dto.response.FineResponse;
import com.library.lbms.dto.response.TransactionResponse;
import com.library.lbms.dto.response.UserResponse;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.Transaction;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.UserRole;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.exception.ResourceNotFoundException;
import com.library.lbms.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;
    private final FineRepository fineRepository;

    // AUTH HELPERS
    private User getAuthenticatedUser() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new BadRequestException("No authenticated user");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.admin;
    }

    // ADMIN ONLY
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByIsActiveTrue(pageable)
                .map(this::mapToResponse);
    }

    // CREATE USER 
    @Override
    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }

        UserRole role = UserRole.member; // default safe role

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Only admin can assign role explicitly
        if (auth != null && !"anonymousUser".equals(auth.getName())) {
            try {
                User current = getAuthenticatedUser();
                if (isAdmin(current) && request.getRole() != null) {
                    role = UserRole.valueOf(request.getRole());
                }
            } catch (Exception ignored) {
                role = UserRole.member;
            }
        }

        LocalDateTime now = LocalDateTime.now();

        User user = User.builder()
                .userId(UUID.randomUUID())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .createdAt(now)
                .updatedAt(now)
                .isActive(true)
                .build();

        return mapToResponse(userRepository.save(user));
    }

    // UPDATE USER (ADMIN OR SELF)
    @Override
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        User current = getAuthenticatedUser();
        boolean admin = isAdmin(current);

        // Additional safety check
        if (!admin && !current.getUserId().equals(userId)) {
            throw new BadRequestException("You can only update your own profile");
        }

        if (request.getFullName() != null) {
            target.setFullName(request.getFullName());
        }

        if (request.getEmail() != null) {
            String newEmail = request.getEmail().trim().toLowerCase();
            boolean emailTaken = userRepository.existsByEmail(newEmail)
                    && !target.getEmail().equalsIgnoreCase(newEmail);
            if (emailTaken) {
                throw new BadRequestException("Email already in use");
            }
            target.setEmail(newEmail);
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            target.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        // Only admin can modify system flags
        if (admin) {
            if (request.getIsActive() != null) {
                target.setIsActive(request.getIsActive());
            }

            if (request.getBlacklistReason() != null) {
                target.setBlacklistReason(request.getBlacklistReason());
            }
        }

        target.setUpdatedAt(LocalDateTime.now());

        return mapToResponse(userRepository.save(target));
    }

    // DELETE USER (SOFT DELETE)
    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(UUID userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long activeLoans = transactionRepository
                .countByUser_UserIdAndReturnDateIsNull(userId);

        boolean hasUnpaidFines = fineRepository.findByUser_UserId(userId)
                .stream()
                .anyMatch(f -> !Boolean.TRUE.equals(f.getPaid()));

        if (activeLoans > 0) {
            throw new BadRequestException("User has active loans");
        }

        if (hasUnpaidFines) {
            throw new BadRequestException("User has unpaid fines");
        }

        user.setIsActive(false);
        user.setBlacklistReason("Account deactivated by admin");
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    // CURRENT USER
    @Override
    public UserResponse getCurrentUserProfile() {
        return mapToResponse(getAuthenticatedUser());
    }

    @Override
    public List<TransactionResponse> getCurrentUserHistory() {
        User user = getAuthenticatedUser();

        return transactionRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FineResponse> getCurrentUserFines() {
        User user = getAuthenticatedUser();

        return fineRepository.findByUser_UserId(user.getUserId())
                .stream()
                .map(this::mapToFineResponse)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<TransactionResponse> getUserHistory(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return transactionRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<FineResponse> getUserFines(UUID userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return fineRepository.findByUser_UserId(userId)
                .stream()
                .map(this::mapToFineResponse)
                .collect(Collectors.toList());
    }

    // LOGIN AUDIT
    @Override
    public void updateLastLogin(String email) {

        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLoginAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    @Override
    public String getFullNameByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getFullName)
                .orElse(null);
    }

    @Override
    public java.time.LocalDateTime getCreatedAtByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getCreatedAt)
                .orElse(null);
    }

    // MAPPERS
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .blacklistReason(user.getBlacklistReason())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction t) {
        String title = null;
        try { title = t.getCopy().getBook().getTitle(); } catch (Exception ignored) {}
        String memberName = null;
        try { memberName = t.getUser().getFullName(); } catch (Exception ignored) {}
        Boolean finePaid = null;
        try {
            Optional<Fine> fine = fineRepository.findByTransaction_TransactionId(t.getTransactionId());
            if (fine.isPresent()) finePaid = fine.get().getPaid();
        } catch (Exception ignored) {}
        return TransactionResponse.builder()
                .transactionId(t.getTransactionId())
                .user_id(t.getUser().getUserId())
                .memberName(memberName)
                .copy_id(t.getCopy().getCopyId())
                .bookTitle(title)
                .checkout_date(t.getIssueDate())
                .due_date(t.getDueDate())
                .return_date(t.getReturnDate())
                .status(t.getStatus().name())
                .finePaid(finePaid)
                .build();
    }

    private FineResponse mapToFineResponse(Fine fine) {
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
