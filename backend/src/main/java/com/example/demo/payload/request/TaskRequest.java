package com.example.demo.payload.request;

import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TaskRequest {
    @NotBlank
    private String title;
    
    private String description;
    
    // Using String to parse date easily and avoid LocalDateTime headaches in plain JSON
    private String dueDate; 

    private String priority;

    private Long projectId;

    private UUID assigneeId;

    private List<UUID> assigneeIds = new ArrayList<>();

    private List<ChecklistItemRequest> checklist = new ArrayList<>();
    
    private List<AttachmentRequest> attachments = new ArrayList<>();

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public List<UUID> getAssigneeIds() { return assigneeIds; }
    public void setAssigneeIds(List<UUID> assigneeIds) { this.assigneeIds = assigneeIds; }
    public List<ChecklistItemRequest> getChecklist() { return checklist; }
    public void setChecklist(List<ChecklistItemRequest> checklist) { this.checklist = checklist; }
    public List<AttachmentRequest> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentRequest> attachments) { this.attachments = attachments; }

    public static class ChecklistItemRequest {
        private Long id;
        private String title;
        private boolean completed;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public static class AttachmentRequest {
        private Long id;
        private String name;
        private String url;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}
