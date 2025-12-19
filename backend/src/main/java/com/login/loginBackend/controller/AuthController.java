package com.login.loginBackend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.login.loginBackend.model.User;
import com.login.loginBackend.repository.UserRepository;
import com.login.loginBackend.service.JwtUtil;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    static class LoginRequest {
        public String username;
        public String password;
    }

    static class RefreshRequest {
        public String refreshToken;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.username);
        Map<String, String> response = new HashMap<>();

        if (user != null && user.getPassword().equals(request.password)) {
            String accessToken = jwtUtil.generateAccessToken(user.getUsername());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("message", "Login successful");
            return response;
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }

    @PostMapping("/refresh-token")
    public Map<String, String> refreshToken(@RequestBody RefreshRequest request) {
        String refreshToken = request.refreshToken;
        Map<String, String> response = new HashMap<>();

        try {
            String username = jwtUtil.extractUsername(refreshToken);

            if (jwtUtil.validateToken(refreshToken, username)) {
                String newAccessToken = jwtUtil.generateAccessToken(username);

                response.put("accessToken", newAccessToken);
                response.put("message", "Token refreshed successfully");
                return response;
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }

        throw new RuntimeException("Invalid request");
    }
}