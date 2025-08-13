package com.dragdrop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dragdrop.model.Screen;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {
    
    List<Screen> findByApplicationId(Long applicationId);
    
    List<Screen> findByApplicationIdOrderByCreatedAtDesc(Long applicationId);
    
    boolean existsByNameAndApplicationId(String name, Long applicationId);
}
