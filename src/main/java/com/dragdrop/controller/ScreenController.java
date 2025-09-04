package com.dragdrop.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dragdrop.model.Screen;
import com.dragdrop.service.ScreenService;

@RestController
@RequestMapping("/api/screens")
@CrossOrigin(origins = "*")
public class ScreenController {
    
    @Autowired
    private ScreenService screenService;
    
    @PostMapping
    public ResponseEntity<?> createScreen(@RequestBody Map<String, Object> request) {
        try {
            Long applicationId = Long.valueOf(request.get("applicationId").toString());
            String name = (String) request.get("name");
            String layoutJson = (String) request.get("layoutJson");
            String screenImagePath = (String) request.get("screenImagePath");
            
            if (name == null || name.trim().isEmpty() || layoutJson == null) {
                return ResponseEntity.badRequest().body("Screen name required");
            }
            
            Screen screen = screenService.createScreen(applicationId, name, layoutJson, screenImagePath);
            return ResponseEntity.ok(screen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Screen>> getAllScreensByApplication(@PathVariable Long applicationId) {
        try {
            List<Screen> screens = screenService.getAllScreensByApplication(applicationId);
            return ResponseEntity.ok(screens);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Screen> getScreenById(@PathVariable Long id) {
        try {
            Screen screen = screenService.getScreenById(id);
            return ResponseEntity.ok(screen);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateScreen(@PathVariable Long id, 
                                             @RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            String layoutJson = (String) request.get("layoutJson");
            String screenImagePath = (String) request.get("screenImagePath");
            
            if (name == null || name.trim().isEmpty() || layoutJson == null) {
                return ResponseEntity.badRequest().body("Screen name required");
            }
            
            Screen screen = screenService.updateScreen(id, name, layoutJson, screenImagePath);
            return ResponseEntity.ok(screen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScreen(@PathVariable Long id) {
        try {
            screenService.deleteScreen(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
