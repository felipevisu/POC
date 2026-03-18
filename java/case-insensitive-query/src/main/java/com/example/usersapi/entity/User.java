package com.example.usersapi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "first_name_enc", nullable = false)
    private String firstNameEnc;
    @Column(name = "first_name_hash", nullable = false)
    private String firstNameHash;

    @Column(name = "last_name_enc", nullable = false)
    private String lastNameEnc;
    @Column(name = "last_name_hash", nullable = false)
    private String lastNameHash;

    @Column(name = "email_enc", nullable = false)
    private String emailEnc;
    @Column(name = "email_hash", nullable = false)
    private String emailHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}