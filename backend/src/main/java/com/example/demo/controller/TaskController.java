package com.example.demo.controller;

import com.example.demo.entity.ChecklistItem;
import com.example.demo.entity.Project;
import com.example.demo.entity.Task;
import com.example.demo.entity.TaskPriority;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.User;
import com.example.demo.payload.request.TaskRequest;
import com.example.demo.payload.response.MessageResponse;
import com.example.demo.payload.response.TaskResponse;
import com.example.demo.repository.ChecklistItemRepository;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.services.UserDetailsImpl;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    TaskRepository taskRepository;

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ChecklistItemRepository checklistItemRepository;

    @GetMapping
    public List<TaskResponse> getTasks() {
        UserDetailsImpl userDetails = currentUserDetails();

        if (isAdmin(userDetails)) {
            return taskRepository.findAll().stream()
                    .map(TaskResponse::from)
                    .toList();
        }

        return taskRepository.findByAssigneesId(userDetails.getId()).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @GetMapping("/project/{projectId}")
    public List<TaskResponse> getTasksByProject(@PathVariable Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @GetMapping("/me")
    public List<TaskResponse> getMyTasks() {
        UserDetailsImpl userDetails = currentUserDetails();
        return taskRepository.findByAssigneesId(userDetails.getId()).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest request) {
        User currentUser = currentUser();
        Project project = resolveProject(request.getProjectId(), currentUser);

        Task task = new Task();
        applyTaskRequest(task, request, project);

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(TaskResponse.from(savedTask));
    }

    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> createTaskForProject(@PathVariable Long projectId, @Valid @RequestBody TaskRequest request) {
        request.setProjectId(projectId);
        return createTask(request);
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> updateTask(@PathVariable Long taskId, @Valid @RequestBody TaskRequest request) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);

        if (!taskOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        Project project = resolveProject(request.getProjectId() != null ? request.getProjectId() : task.getProject().getId(), currentUser());
        applyTaskRequest(task, request, project);

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.ok(TaskResponse.from(savedTask));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            return ResponseEntity.notFound().build();
        }

        taskRepository.deleteById(taskId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @RequestParam String status) {
        UserDetailsImpl userDetails = currentUserDetails();
        Optional<Task> taskOpt = taskRepository.findById(taskId);

        if (!taskOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();

        if (!canWorkOnTask(userDetails, task)) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to update this task status!"));
        }

        try {
            task.setStatus(TaskStatus.valueOf(status.toUpperCase()));
            taskRepository.save(task);
            return ResponseEntity.ok(TaskResponse.from(task));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Status provided (`TODO`, `IN_PROGRESS`, `DONE`)"));
        }
    }

    @PutMapping("/{taskId}/checklist/{checklistItemId}")
    @Transactional
    public ResponseEntity<?> updateChecklistItem(
            @PathVariable Long taskId,
            @PathVariable Long checklistItemId,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String title
    ) {
        UserDetailsImpl userDetails = currentUserDetails();
        Optional<Task> taskOpt = taskRepository.findById(taskId);
        Optional<ChecklistItem> itemOpt = checklistItemRepository.findById(checklistItemId);

        if (!taskOpt.isPresent() || !itemOpt.isPresent() || !itemOpt.get().getTask().getId().equals(taskId)) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        if (!canWorkOnTask(userDetails, task)) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to update this checklist item!"));
        }

        ChecklistItem item = itemOpt.get();
        if (completed != null) {
            item.setCompleted(completed);
        }
        if (title != null && isAdmin(userDetails)) {
            item.setTitle(title.trim());
        }

        checklistItemRepository.save(item);

        // MAGIC RULE: If all checklist items are completed, move task to DONE
        boolean allCompleted = task.getChecklistItems().stream().allMatch(ChecklistItem::isCompleted);
        if (allCompleted && !task.getChecklistItems().isEmpty()) {
            task.setStatus(TaskStatus.DONE);
            taskRepository.save(task);
        }

        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportTasksToCsv() {
        UserDetailsImpl userDetails = currentUserDetails();
        List<Task> tasks;

        if (isAdmin(userDetails)) {
            tasks = taskRepository.findAll();
        } else {
            tasks = taskRepository.findByAssigneesId(userDetails.getId());
        }

        StringBuilder csvContent = new StringBuilder();
        csvContent.append("ID,Title,Description,Status,Priority,Due Date\n");

        for (Task task : tasks) {
            csvContent.append(task.getId()).append(",")
                    .append("\"").append(task.getTitle().replace("\"", "\"\"")).append("\",")
                    .append("\"").append(task.getDescription() != null ? task.getDescription().replace("\"", "\"\"") : "").append("\",")
                    .append(task.getStatus()).append(",")
                    .append(task.getPriority()).append(",")
                    .append(task.getDueDate() != null ? task.getDueDate().toString() : "N/A")
                    .append("\n");
        }

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=tasks_report.csv")
                .header("Content-Type", "text/csv")
                .body(csvContent.toString());
    }

    @DeleteMapping("/{taskId}/checklist/{checklistItemId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteChecklistItem(@PathVariable Long taskId, @PathVariable Long checklistItemId) {
        Optional<Task> taskOpt = taskRepository.findById(taskId);

        if (!taskOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();
        boolean removed = task.getChecklistItems().removeIf(item -> item.getId().equals(checklistItemId));

        if (!removed) {
            return ResponseEntity.notFound().build();
        }

        taskRepository.save(task);
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    private void applyTaskRequest(Task task, TaskRequest request, Project project) {
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setPriority(parsePriority(request.getPriority()));
        task.setDueDate(parseDueDate(request.getDueDate()));
        task.setAssignees(resolveAssignees(request));
        syncChecklist(task, request.getChecklist());
        syncAttachments(task, request.getAttachments());
    }

    private void syncAttachments(Task task, List<TaskRequest.AttachmentRequest> attachments) {
        task.getAttachments().clear();

        if (attachments == null) {
            return;
        }

        attachments.stream()
                .filter(a -> a.getUrl() != null && !a.getUrl().trim().isEmpty())
                .forEach(aRequest -> {
                    com.example.demo.entity.Attachment attachment = new com.example.demo.entity.Attachment();
                    attachment.setName(aRequest.getName() != null ? aRequest.getName().trim() : "Link");
                    attachment.setUrl(aRequest.getUrl().trim());
                    attachment.setTask(task);
                    task.getAttachments().add(attachment);
                });
    }

    private Project resolveProject(Long projectId, User currentUser) {
        if (projectId != null) {
            return projectRepository.findById(projectId).orElseThrow();
        }

        return projectRepository.findByOwnerId(currentUser.getId()).stream()
                .findFirst()
                .orElseGet(() -> {
                    Project project = new Project();
                    project.setName("General Tasks");
                    project.setDescription("Default workspace for standalone tasks.");
                    project.setOwner(currentUser);
                    return projectRepository.save(project);
                });
    }

    private Set<User> resolveAssignees(TaskRequest request) {
        Set<UUID> ids = new HashSet<>();

        if (request.getAssigneeIds() != null) {
            ids.addAll(request.getAssigneeIds());
        }
        if (request.getAssigneeId() != null) {
            ids.add(request.getAssigneeId());
        }

        if (ids.isEmpty()) {
            return new HashSet<>();
        }

        List<User> users = userRepository.findAllById(ids);
        if (users.size() != ids.size()) {
            throw new IllegalArgumentException("One or more assignees were not found.");
        }

        return new HashSet<>(users);
    }

    private void syncChecklist(Task task, List<TaskRequest.ChecklistItemRequest> checklist) {
        task.getChecklistItems().clear();

        if (checklist == null) {
            return;
        }

        checklist.stream()
                .filter(item -> item.getTitle() != null && !item.getTitle().trim().isEmpty())
                .forEach(itemRequest -> {
                    ChecklistItem item = new ChecklistItem();
                    item.setTitle(itemRequest.getTitle().trim());
                    item.setCompleted(itemRequest.isCompleted());
                    item.setTask(task);
                    task.getChecklistItems().add(item);
                });
    }

    private TaskPriority parsePriority(String priority) {
        if (priority == null || priority.isBlank()) {
            return TaskPriority.MEDIUM;
        }

        return TaskPriority.valueOf(priority.toUpperCase());
    }

    private LocalDateTime parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) {
            return null;
        }

        try {
            if (dueDate.length() == 10) {
                return LocalDate.parse(dueDate).atStartOfDay();
            }
            return LocalDateTime.parse(dueDate);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error: dueDate must use ISO format like 2026-05-01 or 2026-05-01T10:15:30");
        }
    }

    private boolean canWorkOnTask(UserDetailsImpl userDetails, Task task) {
        return isAdmin(userDetails) || task.getAssignees().stream()
                .anyMatch(user -> user.getId().equals(userDetails.getId()));
    }

    private boolean isAdmin(UserDetailsImpl userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private UserDetailsImpl currentUserDetails() {
        return (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private User currentUser() {
        return userRepository.findById(currentUserDetails().getId()).orElseThrow();
    }
}
