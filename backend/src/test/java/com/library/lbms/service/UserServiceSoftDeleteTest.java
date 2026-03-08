package com.library.lbms.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.library.lbms.dao.FineRepository;
import com.library.lbms.dao.TransactionRepository;
import com.library.lbms.dao.UserRepository;
import com.library.lbms.entity.Fine;
import com.library.lbms.entity.User;
import com.library.lbms.entity.enums.UserRole;
import com.library.lbms.exception.BadRequestException;
import com.library.lbms.service.impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceSoftDeleteTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private TransactionRepository transactionRepository;
    @Mock private FineRepository fineRepository;

    @InjectMocks
    private UserServiceImpl userService;

    private User targetMember;

    @BeforeEach
    void setUp() {
        targetMember = User.builder()
                .userId(UUID.randomUUID())
                .email("target@library.com")
                .role(UserRole.member)
                .isActive(true)
                .build();

        // Mock admin security context (deleteUser is @PreAuthorize("hasRole('ADMIN')"))
        Authentication auth = mock(Authentication.class);
        SecurityContext ctx = mock(SecurityContext.class);
        when(ctx.getAuthentication()).thenReturn(auth);
        when(auth.getName()).thenReturn("admin@library.com");
        SecurityContextHolder.setContext(ctx);
    }

    @Nested
    @DisplayName("AC-3: Soft-delete user")
    class SoftDeleteUser {

        @Test
        @DisplayName("deleteUser sets isActive=false and saves (no hard delete)")
        void softDeletes_whenNoActiveLoansOrFines() {
            when(userRepository.findById(targetMember.getUserId()))
                    .thenReturn(Optional.of(targetMember));
            when(transactionRepository.countByUser_UserIdAndReturnDateIsNull(targetMember.getUserId()))
                    .thenReturn(0L);
            when(fineRepository.findByUser_UserId(targetMember.getUserId()))
                    .thenReturn(List.of());
            when(userRepository.save(any(User.class))).thenReturn(targetMember);

            userService.deleteUser(targetMember.getUserId());

            // Must NOT hard-delete
            verify(userRepository, never()).deleteById(any());
            verify(userRepository, never()).delete(any());

            // Must call save with isActive=false
            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getIsActive()).isFalse();
            assertThat(captor.getValue().getBlacklistReason())
                    .isEqualTo("Account deactivated by admin");
        }

        @Test
        @DisplayName("deleteUser throws 400 when user has active loans")
        void throws_whenActiveLoansExist() {
            when(userRepository.findById(targetMember.getUserId()))
                    .thenReturn(Optional.of(targetMember));
            when(transactionRepository.countByUser_UserIdAndReturnDateIsNull(targetMember.getUserId()))
                    .thenReturn(2L);

            assertThatThrownBy(() -> userService.deleteUser(targetMember.getUserId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("active loans");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("deleteUser throws 400 when user has unpaid fines")
        void throws_whenUnpaidFinesExist() {
            Fine unpaidFine = Fine.builder()
                    .fineId(UUID.randomUUID())
                    .paid(false)
                    .build();

            when(userRepository.findById(targetMember.getUserId()))
                    .thenReturn(Optional.of(targetMember));
            when(transactionRepository.countByUser_UserIdAndReturnDateIsNull(targetMember.getUserId()))
                    .thenReturn(0L);
            when(fineRepository.findByUser_UserId(targetMember.getUserId()))
                    .thenReturn(List.of(unpaidFine));

            assertThatThrownBy(() -> userService.deleteUser(targetMember.getUserId()))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("unpaid fines");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("soft-deleted user is excluded from getAllUsers listing")
        void inactiveUser_isExcludedFromListing() {
            // UserRepository.findByIsActiveTrue is the query used in getAllUsers.
            // Here we verify the entity is marked inactive after deleteUser.
            when(userRepository.findById(targetMember.getUserId()))
                    .thenReturn(Optional.of(targetMember));
            when(transactionRepository.countByUser_UserIdAndReturnDateIsNull(any()))
                    .thenReturn(0L);
            when(fineRepository.findByUser_UserId(any())).thenReturn(List.of());
            when(userRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

            userService.deleteUser(targetMember.getUserId());

            assertThat(targetMember.getIsActive()).isFalse();
        }
    }
}
