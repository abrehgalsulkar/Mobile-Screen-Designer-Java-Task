package com.dragdrop.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dragdrop.model.Application;
import com.dragdrop.model.Guest;
import com.dragdrop.repository.ApplicationRepository;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private GuestService guestService;
    
    public Application createApplication(String name, String iconPath) {
        Guest guest = guestService.getOrCreateDefaultGuest();
        
        if (applicationRepository.existsByNameAndGuestId(name, guest.getGuestId())) {
            throw new RuntimeException("Application with name '" + name + "' already exists");
        }
        
        Application application = new Application(name, guest.getGuestId());
        application.setIconPath(iconPath);
        
        return applicationRepository.save(application);
    }
    
    public List<Application> getAllApplicationsByGuest() {
        Guest guest = guestService.getOrCreateDefaultGuest();
        return applicationRepository.findByGuestIdOrderByCreatedAtDesc(guest.getGuestId());
    }
    
    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with ID: " + id));
    }
    
    public Application updateApplication(Long id, String name, String iconPath) {
        Application application = getApplicationById(id);
        
        if (!application.getName().equals(name) && 
            applicationRepository.existsByNameAndGuestId(name, application.getGuestId())) {
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
