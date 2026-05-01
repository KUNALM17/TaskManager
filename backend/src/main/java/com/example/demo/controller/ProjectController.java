package com.example.demo.controller;

import com.example.demo.entity.Project;
import com.example.demo.entity.User;
import com.example.demo.payload.request.ProjectRequest;
import com.example.demo.payload.response.ProjectResponse;
import com.example.demo.repository.ProjectRepository;
import com.example.demo.repository.TaskRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    ProjectRepository projectRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    TaskRepository taskRepository;

    // Get All Projects (For Admins) or Only Assigned/Owned ones
    // Simplifying: Let Admins see all, Members see all. (In reality, filter by involvement)
    @GetMapping
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    // Role-Based: ONLY Admins can create projects
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProject(@Valid @RequestBody ProjectRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userRepository.findById(userDetails.getId()).orElseThrow();

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setOwner(currentUser);

        Project savedProject = projectRepository.save(project);
        return ResponseEntity.ok(ProjectResponse.from(savedProject));
    }

    // Optional: Delete project
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        if (!projectRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        taskRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
