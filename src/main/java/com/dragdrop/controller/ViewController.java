package com.dragdrop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.dragdrop.service.ApplicationService;
import com.dragdrop.service.ScreenService;

@Controller
public class ViewController {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ScreenService screenService;
    
    @GetMapping("/")
    public String home(Model model) {
        try {
            model.addAttribute("applications", applicationService.getAllApplicationsByGuest());
        } catch (Exception e) {
            model.addAttribute("applications", new java.util.ArrayList<>());
        }
        return "home";
    }
    
    @GetMapping("/designer/{applicationId}")
    public String designer(@PathVariable Long applicationId, Model model) {
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
                           Model model) {
        try {
            model.addAttribute("application", applicationService.getApplicationById(applicationId));
            model.addAttribute("screen", screenService.getScreenById(screenId));
        } catch (Exception e) {
            return "redirect:/designer/" + applicationId;
        }
        return "designer";
    }
}
