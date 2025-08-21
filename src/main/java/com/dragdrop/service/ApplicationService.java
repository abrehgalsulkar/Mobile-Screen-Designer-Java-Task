package com.dragdrop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dragdrop.model.Application;
import com.dragdrop.repository.ApplicationRepository;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    public Application createApplication(String name, String iconPath) {
        Long userId = 1L;
        
        if (applicationRepository.existsByNameAndUserId(name, userId)) {
            throw new RuntimeException("Application with name '" + name + "' already exists");
        }
        
        Application application = new Application(name, userId);
        application.setIconPath(iconPath);
        
        return applicationRepository.save(application);
    }
    
    public List<Application> getAllApplicationsByUser() {
        return applicationRepository.findAll();
    }
    
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + id));
    }
    
    public Application updateApplication(Long id, String name, String iconPath) {
        Application application = getApplicationById(id);
        
        if (!application.getName().equals(name) && 
            applicationRepository.existsByNameAndUserId(name, application.getUserId())) {
            throw new RuntimeException("Application with name '" + name + "' already exists");
        }
        
        application.setName(name);
        application.setIconPath(iconPath);
        
        return applicationRepository.save(application);
    }
    
    public void deleteApplication(Long id) {
        if (!applicationRepository.existsById(id)) {
            throw new RuntimeException("Application not found with ID: " + id);
        }
        applicationRepository.deleteById(id);
    }
    

}
