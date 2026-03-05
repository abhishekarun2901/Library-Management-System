package com.library.lbms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fine {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "fine_id", updatable = false, nullable = false)
    private UUID fineId;

    @OneToOne
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private BigDecimal amount;

    private String reason;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Builder.Default
    @Column(nullable = false)
    private Boolean paid = false;
}