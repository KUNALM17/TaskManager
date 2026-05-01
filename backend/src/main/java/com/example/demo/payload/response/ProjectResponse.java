package com.example.demo.payload.response;

import com.example.demo.entity.Project;

import java.time.LocalDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        UserSummaryResponse owner,
        LocalDateTime createdAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                UserSummaryResponse.from(project.getOwner()),
                project.getCreatedAt()
        );
    }
}
