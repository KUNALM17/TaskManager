package com.example.demo.payload.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class TaskRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    // Using String to parse date easily and avoid LocalDateTime headaches in plain JSON
    private String dueDate; 
    
    private UUID assigneeId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
}