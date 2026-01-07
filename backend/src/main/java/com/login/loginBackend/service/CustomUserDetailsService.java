package com.login.loginBackend.service;

import com.login.loginBackend.model.User;
import com.login.loginBackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // We use 'email' to find the user because our system uses email for login
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Return the user details to Spring Security
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), // Set email as the username for authentication
                user.getPassword(),
                new ArrayList<>() // No roles/authorities for now
        );
    }
}