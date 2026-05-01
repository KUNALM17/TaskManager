package com.example.demo.controller;

import com.example.demo.entity.Project;
import com.example.demo.entity.Task;
import com.example.demo.entity.TaskStatus;
import com.example.demo.entity.User;
import com.example.demo.payload.request.TaskRequest;
import com.example.demo.payload.response.MessageResponse;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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

    // Get all tasks for a specific project
    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    // Get tasks assigned to the CURRENT user
    @GetMapping("/me")
    public List<Task> getMyTasks() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return taskRepository.findByAssigneeId(userDetails.getId());
    }

    // Create a new task (Only Admins)
    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTask(@PathVariable Long projectId, @Valid @RequestBody TaskRequest request) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        
        if (!projectOpt.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Project NOT found!"));
        }

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(projectOpt.get());

        if (request.getAssigneeId() != null) {
            Optional<User> assigneeOpt = userRepository.findById(request.getAssigneeId());
            assigneeOpt.ifPresent(task::setAssignee);
        }

        if (request.getDueDate() != null && !request.getDueDate().isEmpty()) {
            try {
                task.setDueDate(LocalDateTime.parse(request.getDueDate())); // requires "2023-08-30T10:15:30"
            } catch (Exception e) {
                // If it fails to parse, leave it null or handle error
            }
        }

        task = taskRepository.save(task);
        return ResponseEntity.ok(task);
    }

    // Update Status (Admins OR Assigned Member)
    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId, @RequestParam String status) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Optional<Task> taskOpt = taskRepository.findById(taskId);

        if (!taskOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Task task = taskOpt.get();

        // RBAC CHECK
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(userDetails.getId());

        if (!isAdmin && !isAssignee) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to update this task status!"));
        }

        try {
            task.setStatus(TaskStatus.valueOf(status.toUpperCase()));
            taskRepository.save(task);
            return ResponseEntity.ok(task);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid Status provided (`TODO`, `IN_PROGRESS`, `DONE`)"));
        }
    }
}