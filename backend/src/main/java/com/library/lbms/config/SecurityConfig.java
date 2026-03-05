package com.library.lbms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.library.lbms.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/v1/books/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/v1/transactions/**").hasRole("ADMIN")

                .requestMatchers("/v1/transactions/**",
                                 "/v1/reservations/**",
                                 "/v1/copies/**",
                                 "/v1/notifications/**").authenticated()

                .requestMatchers(HttpMethod.POST, "/v1/books/**",
                                                  "/v1/copies/**",
                                                  "/v1/fines/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/v1/fines/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.PATCH, "/v1/books/**",
                                                   "/v1/copies/**",
                                                   "/v1/fines/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/v1/**").hasRole("ADMIN")
                .requestMatchers("/v1/reports").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/v1/users")
                .hasAnyRole("ADMIN", "MEMBER")                
                .anyRequest().authenticated()
            )
            .sessionManagement(sess ->
                sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
