package com.dragdrop.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "screen")
public class Screen {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "application_id", nullable = false)
    private Long applicationId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "layout_json", nullable = false, columnDefinition = "TEXT")
    private String layoutJson;
    
    @Column(name = "screen_image_path")
    private String screenImagePath;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", insertable = false, updatable = false)
    @JsonIgnore
    private Application application;
    
    // Default constructor
    public Screen() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Constructor with required fields
    public Screen(Long applicationId, String name, String layoutJson) {
        this.applicationId = applicationId;
        this.name = name;
        this.layoutJson = layoutJson;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getApplicationId() {
        return applicationId;
    }
    
    public void setApplicationId(Long applicationId) {
        this.applicationId = applicationId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getLayoutJson() {
        return layoutJson;
    }
    
    public void setLayoutJson(String layoutJson) {
        this.layoutJson = layoutJson;
    }
    
    public String getScreenImagePath() {
        return screenImagePath;
    }
    
    public void setScreenImagePath(String screenImagePath) {
        this.screenImagePath = screenImagePath;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Application getApplication() {
        return application;
    }
    
    public void setApplication(Application application) {
        this.application = application;
    }
}
