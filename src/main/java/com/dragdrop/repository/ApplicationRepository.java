package com.dragdrop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dragdrop.model.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    
    List<Application> findByGuestId(String guestId);
    
    List<Application> findByGuestIdOrderByCreatedAtDesc(String guestId);
    
    boolean existsByNameAndGuestId(String name, String guestId);
}
