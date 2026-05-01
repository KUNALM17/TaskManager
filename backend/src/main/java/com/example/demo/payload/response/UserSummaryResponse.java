package com.example.demo.payload.response;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;

import java.util.UUID;

public record UserSummaryResponse(UUID id, String name, String email, Role role) {
    public static UserSummaryResponse from(User user) {
        if (user == null) {
            return null;
        }

        return new UserSummaryResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
