package com.login.loginBackend.controller;

import com.login.loginBackend.model.Account;
import com.login.loginBackend.model.User;
import com.login.loginBackend.repository.AccountRepository;
import com.login.loginBackend.repository.UserRepository;
import com.login.loginBackend.service.EmailService;
import com.login.loginBackend.service.JwtUtil;
import com.login.loginBackend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;
    @Autowired private PasswordEncoder passwordEncoder;

    // 1. SIGNUP REQUEST (OTP Send)
    @PostMapping("/signup-request")
    public ResponseEntity<?> requestSignup(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // FIX: Check by EMAIL, not username
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Collections.singletonMap("message", "Email is already registered."));
        }

        String otp = otpService.generateOtp(email);
        
        // Console log for testing if email server fails
        System.out.println("DEBUG OTP for " + email + ": " + otp);
        
        emailService.sendEmail(email, "VaultCore - Verification OTP", "Your secure signup OTP is: " + otp);

        return ResponseEntity.ok(Collections.singletonMap("message", "OTP sent successfully."));
    }

    // 2. SIGNUP VERIFY (Create User)
    @PostMapping("/signup-verify")
    public ResponseEntity<?> completeSignup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String otp = request.get("otp");

        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "Invalid or expired OTP."));
        }

        // Check if user exists again to be safe
        if (userRepository.findByEmail(email).isPresent()) {
             return ResponseEntity.status(HttpStatus.CONFLICT).body(Collections.singletonMap("message", "User already exists."));
        }

        // Create new User entity
        User user = new User();
        // FIX: Extract "ishaq" from "ishaq@gmail.com" for display username
        String displayUsername = email.split("@")[0];
        
        user.setUsername(displayUsername); 
        user.setEmail(email); // FIX: Setting the Email field is mandatory!
        user.setPassword(passwordEncoder.encode(password)); // Hashing Password
        
        userRepository.save(user);

        // Initialize Account
        Account account = new Account();
        account.setUserId(user.getId());
        account.setAccountNumber("ACC-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        account.setCurrentBalance(BigDecimal.valueOf(5000)); // Joining Bonus
        accountRepository.save(account);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "User registered successfully."));
    }

    // 3. LOGIN (Authenticate)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        // FIX: Find user by EMAIL
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // FIX: Use passwordEncoder.matches() instead of .equals()
            if (passwordEncoder.matches(password, user.getPassword())) {
                
                // Generate token using Email (Subject)
                String accessToken = jwtUtil.generateAccessToken(user.getEmail());

                Map<String, String> response = new HashMap<>();
                response.put("accessToken", accessToken);
                response.put("username", user.getUsername());
                response.put("email", user.getEmail());
                
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid email or password."));
    }
}