package com.dragdrop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.dragdrop.model.Application;
import com.dragdrop.model.User;
import com.dragdrop.repository.ApplicationRepository;
import com.dragdrop.repository.UserRepository;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            return user != null ? user.getId() : null;
        }
        return null;
    }
    
    public Application createApplication(String name, String iconPath) {
        Long userId = getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("User not authenticated");
        }
        
        if (applicationRepository.existsByNameAndUserId(name, userId)) {
            throw new RuntimeException("Application with name '" + name + "' already exists");
        }
        
        Application application = new Application(name, userId);
        application.setIconPath(iconPath);
        application.setUpdatedAt(java.time.LocalDateTime.now());
        
        return applicationRepository.save(application);
    }
    
    public List<Application> getAllApplicationsByUser() {
        Long userId = getCurrentUserId();
        if (userId == null) {
            return new java.util.ArrayList<>();
        }
        return applicationRepository.findByUserId(userId);
    }
    
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + id));
    }
    
    public Application updateApplication(Long id, String name, String iconPath) {
        Application application = getApplicationById(id);
        Long currentUserId = getCurrentUserId();
        
        // Check if the user whoIS CURRENTLY LOGGED INowns this application
        if (!application.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Access denied: You can only edit your own applications");
        }
        
        if (!application.getName().equals(name) && 
            applicationRepository.existsByNameAndUserId(name, currentUserId)) {
            throw new RuntimeException("Application with name '" + name + "' already exists");
        }
        
        application.setName(name);
        
        if (iconPath != null && !iconPath.trim().isEmpty()) {
            application.setIconPath(iconPath);
        }
        application.setUpdatedAt(java.time.LocalDateTime.now());
        
        return applicationRepository.save(application);
    }
    
    public void deleteApplication(Long id) {
        Application application = getApplicationById(id);
        Long currentUserId = getCurrentUserId();
            
            // Check if the user whoIS CURRENTLY LOGGED INowns this application
        if (!application.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Access denied: You can only delete your own applications");
        }
        
        applicationRepository.deleteById(id);
    }
    
    // Update updatedAt timestamp
    public void touchUpdatedAt(Long applicationId) {
        Application app = getApplicationById(applicationId);
        app.setUpdatedAt(java.time.LocalDateTime.now());
        applicationRepository.save(app);
    }


}
