package com.example.usersapi.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserDTO(
        UUID id,
        String firstName,
        String lastName,
        String email,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
