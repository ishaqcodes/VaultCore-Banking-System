package com.login.loginBackend.repository;

import com.login.loginBackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // Login ke liye hum ye use karenge
    Optional<User> findByEmail(String email);

    // Signup check ke liye
    Optional<User> findByUsername(String username);
    
    // Ye check karne ke liye ki email pehle se exist karta hai ya nahi
    Boolean existsByEmail(String email);
}