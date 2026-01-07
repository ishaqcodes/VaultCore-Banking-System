package com.login.loginBackend.controller;

import com.login.loginBackend.model.Account;
import com.login.loginBackend.model.User;
import com.login.loginBackend.repository.AccountRepository;
import com.login.loginBackend.repository.UserRepository;
import com.login.loginBackend.service.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private static final Logger logger = LoggerFactory.getLogger(AccountController.class);

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/my-balance")
    public ResponseEntity<?> getBalance(@RequestHeader("Authorization") String token) {

        try {
            // 1. Extract email from JWT
            String email = jwtUtil.extractUsername(token.substring(7));

            // 2. Find user (if not found → safe default)
            User user = userRepository.findByEmail(email).orElse(null);

            Map<String, Object> response = new HashMap<>();

            if (user == null) {
                // New / invalid user fallback
                response.put("currentBalance", BigDecimal.ZERO);
                response.put("username", "");
                response.put("email", email);
                response.put("accountNumber", "");
                return ResponseEntity.ok(response);
            }

            // 3. Find account (if not found → ZERO balance, NOT error)
            Account account = accountRepository.findByUserId(user.getId()).orElse(null);

            response.put("username", user.getUsername());
            response.put("email", user.getEmail());

            if (account == null) {
                response.put("currentBalance", BigDecimal.ZERO);
                response.put("accountNumber", "");
            } else {
                response.put("id", account.getId());
                response.put("accountNumber", account.getAccountNumber());
                response.put("currentBalance", account.getCurrentBalance());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error while retrieving account balance", e);

            // LAST-resort fallback (never crash dashboard)
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("currentBalance", BigDecimal.ZERO);
            fallback.put("username", "");
            fallback.put("email", "");
            fallback.put("accountNumber", "");

            return ResponseEntity.ok(fallback);
        }
    }
}
