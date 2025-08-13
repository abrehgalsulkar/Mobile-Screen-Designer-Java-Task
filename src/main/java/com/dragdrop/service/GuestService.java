package com.dragdrop.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dragdrop.model.Guest;
import com.dragdrop.repository.GuestRepository;

@Service
public class GuestService {
    
    private static final String DEFAULT_GUEST_ID = "guest_001";
    
    @Autowired
    private GuestRepository guestRepository;
    
    public Guest getOrCreateDefaultGuest() {
        return guestRepository.findByGuestId(DEFAULT_GUEST_ID)
                .orElseGet(() -> {
                    Guest guest = new Guest(DEFAULT_GUEST_ID);
                    return guestRepository.save(guest);
                });
    }
    
    public Guest getGuestById(String guestId) {
        return guestRepository.findByGuestId(guestId)
                .orElseThrow(() -> new RuntimeException("Guest not found with ID: " + guestId));
    }
    
    public boolean guestExists(String guestId) {
        return guestRepository.existsByGuestId(guestId);
    }
}
