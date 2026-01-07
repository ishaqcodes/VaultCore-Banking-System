package com.login.loginBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            // Ensure this matches the username in your application.properties
            message.setFrom("shaikhmuhammedishaq@gmail.com"); 
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            javaMailSender.send(message);
            
            System.out.println("Email sent successfully to: " + to);

        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            
            // Fallback: Print the body to console for local testing/debugging
            System.out.println("Fallback - Email Body for " + to + ": " + body); 
        }
    }
}