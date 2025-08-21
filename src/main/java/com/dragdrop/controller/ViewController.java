package com.dragdrop.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.dragdrop.model.Application;
import com.dragdrop.service.ApplicationService;
import com.dragdrop.service.ScreenService;

import jakarta.servlet.http.HttpSession;

@Controller
public class ViewController {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ScreenService screenService;
    
    @GetMapping("/")
    public String home(HttpSession session, Model model) {
        // Check if user is logged in
        if (session.getAttribute("userId") == null) {
            return "redirect:/login";
        }
        
        try {
            List<Application> applications = applicationService.getAllApplicationsByUser();
            model.addAttribute("applications", applications);
        } catch (Exception e) {
            model.addAttribute("applications", new java.util.ArrayList<>());
            model.addAttribute("error", "Failed to load applications: " + e.getMessage());
        }
        return "home";
    }
    
    @GetMapping("/designer/{applicationId}")
    public String designer(@PathVariable Long applicationId, HttpSession session, Model model) {
        // Check if user is logged in
        if (session.getAttribute("userId") == null) {
            return "redirect:/login";
        }
        
        try {
            model.addAttribute("application", applicationService.getApplicationById(applicationId));
            model.addAttribute("screens", screenService.getAllScreensByApplication(applicationId));
            //default screen for new design
            model.addAttribute("screen", new com.dragdrop.model.Screen());
        } catch (Exception e) {
            return "redirect:/";
        }
        return "designer";
    }
    
    @GetMapping("/designer/{applicationId}/screen/{screenId}")
    public String editScreen(@PathVariable Long applicationId, 
                           @PathVariable Long screenId, 
                           HttpSession session,
                           Model model) {
        // Check if user is logged in
        if (session.getAttribute("userId") == null) {
            return "redirect:/login";
        }
        
        try {
            model.addAttribute("application", applicationService.getApplicationById(applicationId));
            model.addAttribute("screen", screenService.getScreenById(screenId));
        } catch (Exception e) {
            return "redirect:/designer/" + applicationId;
        }
        return "designer";
    }
}
