package com.example.usersapi.controller;

import com.example.usersapi.dto.CreateUserRequest;
import com.example.usersapi.dto.UserDTO;
import com.example.usersapi.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // POST /users
    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    // GET /users
    @GetMapping
    public ResponseEntity<List<UserDTO>> findAll() {
        return ResponseEntity.ok(userService.findAll());
    }

    // GET /users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // GET /users/search?firstName=john&lastName=doe&email=john@doe.com
    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> search(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String email) {

        return ResponseEntity.ok(userService.search(firstName, lastName, email));
    }
}