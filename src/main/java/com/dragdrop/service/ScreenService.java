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
        
        return screenRepository.save(screen);
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
        
        return screenRepository.save(screen);
    }
    
    public void deleteScreen(Long id) {
        if (!screenRepository.existsById(id)) {
            throw new RuntimeException("Screen not found with ID: " + id);
        }
        screenRepository.deleteById(id);
    }
    
    public Screen updateScreenLayout(Long id, String layoutJson) {
        Screen screen = getScreenById(id);
        screen.setLayoutJson(layoutJson);
        return screenRepository.save(screen);
    }
}
