package com.library.lbms.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.lbms.dto.request.CreateUserRequest;
import com.library.lbms.dto.request.LoginRequest;
import com.library.lbms.dto.response.AuthResponse;
import com.library.lbms.dto.response.UserResponse;
import com.library.lbms.security.JwtService;
import com.library.lbms.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/auth") 
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody CreateUserRequest request) {
        return ResponseEntity.status(201).body(userService.createUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        userService.updateLastLogin(request.getEmail());

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "").toLowerCase())
                .orElse("member");

        String fullName = userService.getFullNameByEmail(request.getEmail());

        LocalDateTime createdAt = userService.getCreatedAtByEmail(request.getEmail());
        String memberSince = createdAt != null
                ? createdAt.format(DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH))
                : null;

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .role(role)
                .fullName(fullName)
                .memberSince(memberSince)
                .build());
    }
}