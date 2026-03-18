package com.example.usersapi;

import com.example.usersapi.dto.CreateUserRequest;
import com.example.usersapi.repository.UserRepository;
import com.example.usersapi.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has data, skipping seed.");
            return;
        }

        log.info("Seeding initial users...");

        userService.create(new CreateUserRequest("Alice",   "Smith",   "alice.smith@example.com"));
        userService.create(new CreateUserRequest("Bob",     "Johnson", "bob.johnson@example.com"));
        userService.create(new CreateUserRequest("Carol",   "Williams","carol.williams@example.com"));
        userService.create(new CreateUserRequest("David",   "Brown",   "david.brown@example.com"));
        userService.create(new CreateUserRequest("Eve",     "Jones",   "eve.jones@example.com"));

        log.info("Seeded {} users.", userRepository.count());
    }
}
