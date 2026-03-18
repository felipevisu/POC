package com.example.usersapi.service;

import com.example.usersapi.dto.CreateUserRequest;
import com.example.usersapi.dto.UserDTO;
import com.example.usersapi.entity.User;
import com.example.usersapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository    userRepository;
    private final EncryptionService encryptionService;

    @Transactional
    public UserDTO create(CreateUserRequest request) {
        if (userRepository.findByEmailHash(encryptionService.hash(request.email())).isPresent()) {
            throw new IllegalArgumentException("Email already registered.");
        }

        User user = new User();
        user.setFirstNameEnc(encryptionService.encrypt(request.firstName()));
        user.setFirstNameHash(encryptionService.hash(request.firstName()));
        user.setLastNameEnc(encryptionService.encrypt(request.lastName()));
        user.setLastNameHash(encryptionService.hash(request.lastName()));
        user.setEmailEnc(encryptionService.encrypt(request.email()));
        user.setEmailHash(encryptionService.hash(request.email()));

        return toDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        return userRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new NoSuchElementException("User not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> search(String firstName, String lastName, String email) {
        if (isBlank(firstName) && isBlank(lastName) && isBlank(email)) {
            throw new IllegalArgumentException("At least one search parameter (firstName, lastName, email) is required.");
        }

        String firstNameHash = isBlank(firstName) ? null : encryptionService.hash(firstName);
        String lastNameHash  = isBlank(lastName)  ? null : encryptionService.hash(lastName);
        String emailHash     = isBlank(email)     ? null : encryptionService.hash(email);

        return userRepository.search(firstNameHash, lastNameHash, emailHash)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(
            user.getId(),
            encryptionService.decrypt(user.getFirstNameEnc()),
            encryptionService.decrypt(user.getLastNameEnc()),
            encryptionService.decrypt(user.getEmailEnc()),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}