package com.dragdrop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dragdrop.model.Guest;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Long> {
    
    Optional<Guest> findByGuestId(String guestId);
    
    boolean existsByGuestId(String guestId);
}
