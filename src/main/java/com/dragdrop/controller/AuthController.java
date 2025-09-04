package com.dragdrop.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.dragdrop.service.UserService;

@Controller
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/login")
    public String login(@RequestParam(value = "error", required = false) String error,
                       @RequestParam(value = "logout", required = false) String logout,
                       @RequestParam(value = "registered", required = false) String registered,
                       Model model) {
        
        if (error != null) {
            model.addAttribute("error", "Invalid username or password");
        }
        
        if (logout != null) {
            model.addAttribute("message", "You have been logged out successfully");
        }
        
        if (registered != null) {
            model.addAttribute("message", "Registration successful! Please login.");
        }
        
        return "login";
    }
    
    @GetMapping("/register")
    public String registerForm() {
        return "register";
    }
    
    @PostMapping("/register")
    public String register(@RequestParam String username,
                          @RequestParam String email,
                          @RequestParam String contactNumber,
                          @RequestParam String password,
                          @RequestParam String confirmPassword,
                          RedirectAttributes redirectAttributes) {
        redirectAttributes.addFlashAttribute("username", username);
        redirectAttributes.addFlashAttribute("email", email);
        redirectAttributes.addFlashAttribute("contactNumber", contactNumber);

        // input validations
        String trimmedUsername = username == null ? "" : username.trim();
        String trimmedEmail = email == null ? "" : email.trim();
        String trimmedContact = contactNumber == null ? "" : contactNumber.trim();

        if (trimmedUsername.length() < 3) {
            redirectAttributes.addFlashAttribute("error", "Username must be at least 3 characters long");
            return "redirect:/register";
        }

        if (!password.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("error", "Passwords do not match");
            return "redirect:/register";
        }

        if (password == null || password.length() < 6) {
            redirectAttributes.addFlashAttribute("error", "Password must be at least 6 characters long");
            return "redirect:/register";
        }

        // Must contain letters, numbers and at least one special character
        java.util.regex.Pattern pwdPattern = java.util.regex.Pattern.compile("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&]).{6,}$");
        if (!pwdPattern.matcher(password).matches()) {
            redirectAttributes.addFlashAttribute("error", "Password must contain letters, numbers, and at least one special character");
            return "redirect:/register";
        }

        if (!trimmedContact.isEmpty()) {
            if (!trimmedContact.matches("^[0-9]{10,15}$")) {
                redirectAttributes.addFlashAttribute("error", "Contact Number must be digits only (10-15 digits)");
                return "redirect:/register";
            }
        }

        if (!trimmedEmail.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            redirectAttributes.addFlashAttribute("error", "Please enter a valid email address");
            return "redirect:/register";
        }

        try {
            userService.createUser(trimmedUsername, trimmedEmail, trimmedContact, password);
            return "redirect:/login?registered";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        }
    }
}