package com.login.loginBackend.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    
    // Using ConcurrentHashMap for thread-safe in-memory storage
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    public String generateOtp(String username) {
        // Generates a random 6-digit OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); 
        otpStorage.put(username, otp);
        return otp;
    }

    public boolean validateOtp(String username, String otp) {
        if (otpStorage.containsKey(username) && otpStorage.get(username).equals(otp)) {
            otpStorage.remove(username); // Remove OTP immediately after use
            return true;
        }
        return false;
    }
}