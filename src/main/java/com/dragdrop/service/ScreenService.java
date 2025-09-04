package com.dragdrop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dragdrop.model.Screen;
import com.dragdrop.repository.ScreenRepository;

@Service
public class ScreenService {
    
    @Autowired
    private ScreenRepository screenRepository;
    
    @Autowired
    private ApplicationService applicationService;
    
    public Screen createScreen(Long applicationId, String name, String layoutJson, String screenImagePath) {
        // Get application ID TO CHECK IF IT EXISTS
        applicationService.getApplicationById(applicationId);
        
        if (screenRepository.existsByNameAndApplicationId(name, applicationId)) {
            throw new RuntimeException("Screen with name '" + name + "' already exists in this application");
        }
        
        Screen screen = new Screen(applicationId, name, layoutJson);
        screen.setScreenImagePath(screenImagePath);

        Screen saved = screenRepository.save(screen);
        // update updatedAt here for PARENT APPLICATION SERVICE
        applicationService.touchUpdatedAt(applicationId);
        return saved;
    }
    
    public List<Screen> getAllScreensByApplication(Long applicationId) {
        applicationService.getApplicationById(applicationId);
        
        return screenRepository.findByApplicationIdOrderByCreatedAtDesc(applicationId);
    }
    
    public Screen getScreenById(Long id) {
        return screenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Screen not found with ID: " + id));
    }
    
    public Screen updateScreen(Long id, String name, String layoutJson, String screenImagePath) {
        Screen screen = getScreenById(id);
        
        if (!screen.getName().equals(name) && 
            screenRepository.existsByNameAndApplicationId(name, screen.getApplicationId())) {
            throw new RuntimeException("Screen with name '" + name + "' already exists in this application");
        }
        
        screen.setName(name);
        screen.setLayoutJson(layoutJson);
        screen.setScreenImagePath(screenImagePath);

        Screen saved = screenRepository.save(screen);
        applicationService.touchUpdatedAt(screen.getApplicationId());
        return saved;
    }
    
    public void deleteScreen(Long id) {
        Screen screen = getScreenById(id);
        screenRepository.deleteById(id);
        applicationService.touchUpdatedAt(screen.getApplicationId());
    }
    
    
}
