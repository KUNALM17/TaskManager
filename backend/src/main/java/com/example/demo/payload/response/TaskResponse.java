package com.example.demo.payload.response;

import com.example.demo.entity.Task;
import com.example.demo.entity.TaskPriority;
import com.example.demo.entity.TaskStatus;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDateTime dueDate,
        ProjectResponse project,
        List<UserSummaryResponse> assignees,
        List<ChecklistItemResponse> checklist,
        List<AttachmentResponse> attachments,
        LocalDateTime createdAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority() != null ? task.getPriority() : TaskPriority.MEDIUM,
                task.getDueDate(),
                ProjectResponse.from(task.getProject()),
                task.getAssignees().stream()
                        .sorted(Comparator.comparing(user -> user.getName().toLowerCase()))
                        .map(UserSummaryResponse::from)
                        .toList(),
                task.getChecklistItems().stream()
                        .map(ChecklistItemResponse::from)
                        .toList(),
                task.getAttachments().stream()
                        .map(AttachmentResponse::from)
                        .toList(),
                task.getCreatedAt()
        );
    }
}
