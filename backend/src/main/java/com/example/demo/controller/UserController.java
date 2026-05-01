package com.example.demo.controller;

import com.example.demo.payload.response.UserSummaryResponse;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    public List<UserSummaryResponse> getUsers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(user -> user.getName().toLowerCase()))
                .map(UserSummaryResponse::from)
                .toList();
    }

    @PutMapping("/{id}/role")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> updateUserRole(@PathVariable java.util.UUID id, @RequestParam String role) {
        return userRepository.findById(id).map(user -> {
            try {
                user.setRole(com.example.demo.entity.Role.valueOf("ROLE_" + role.toUpperCase()));
                userRepository.save(user);
                return org.springframework.http.ResponseEntity.ok(UserSummaryResponse.from(user));
            } catch (IllegalArgumentException e) {
                return org.springframework.http.ResponseEntity.badRequest().body(new com.example.demo.payload.response.MessageResponse("Error: Invalid role provided"));
            }
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public org.springframework.http.ResponseEntity<?> deleteUser(@PathVariable java.util.UUID id) {
        if (!userRepository.existsById(id)) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return org.springframework.http.ResponseEntity.ok().build();
    }
}
