package com.library.lbms.entity;

import com.library.lbms.entity.enums.CopyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "book_copies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Copy {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "copy_id", updatable = false, nullable = false)
    private UUID copyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CopyStatus status;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
}