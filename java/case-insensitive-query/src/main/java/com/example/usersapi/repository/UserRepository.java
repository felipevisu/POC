package com.example.usersapi.repository;

import com.example.usersapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailHash(String emailHash);
    List<User> findByFirstNameHash(String firstNameHash);
    List<User> findByLastNameHash(String lastNameHash);

    @Query(""" 
    SELECT u FROM User u
    WHERE (:firstNameHash IS NULL OR u.firstNameHash = :firstNameHash)
        AND (:lastNameHash IS NULL OR u.lastNameHash = :lastNameHash)
        AND (:emailHash IS NULL OR u.emailHash = :emailHash)
    """)
    List<User> search(
            @Param("firstNameHash") String firstNameHash,
            @Param("lastNameHash") String lastNameHash,
            @Param("emailHash") String emailHash
    );
}