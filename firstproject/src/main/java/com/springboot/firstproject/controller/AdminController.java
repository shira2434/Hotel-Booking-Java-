package com.springboot.firstproject.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    // credentials קבועים לבעל המלון
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "hotel1234";

    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String username, @RequestParam String password) {
        if (!ADMIN_USERNAME.equals(username) || !ADMIN_PASSWORD.equals(password))
            throw new RuntimeException("שם משתמש או סיסמה שגויים");
        return Map.of("username", username, "role", "ADMIN", "name", "מנהל המלון");
    }
}
