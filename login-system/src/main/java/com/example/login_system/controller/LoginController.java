package com.example.login_system.controller;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

import com.example.login_system.model.LoginHistory;
import com.example.login_system.service.LoginService;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class LoginController {

    private final LoginService service;

    public LoginController(LoginService service) {
        this.service = service;
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    @PostMapping("/login")
    public LoginHistory login(@RequestBody Map<String, String> body,
                             HttpServletRequest request) {

        String username = body.get("username");
        String password = body.get("password");

        if (!service.validateUser(username, password)) {
            throw new RuntimeException("Invalid credentials");
        }

        String ip = getClientIp(request);

        return service.saveLogin(username, ip);
    }

    @GetMapping("/history")
    public List<LoginHistory> history() {
        return service.getAll();
    }
}