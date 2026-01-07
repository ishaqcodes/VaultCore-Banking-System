package com.login.loginBackend.controller;

import com.login.loginBackend.model.Transaction;
import com.login.loginBackend.service.EmailService;
import com.login.loginBackend.service.OtpService;
import com.login.loginBackend.service.PdfService;
import com.login.loginBackend.service.TransactionService;
import com.login.loginBackend.service.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transaction")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfService pdfService;

    @Autowired
    private JwtUtil jwtUtil;

    // 1️⃣ Request OTP
    @PostMapping("/request-transfer-otp")
    public ResponseEntity<?> requestOtp(
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing token"));
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        String otp = otpService.generateOtp(email);

        emailService.sendEmail(
                email,
                "VaultCore Transaction OTP",
                "Your OTP is: " + otp
        );

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    // 2️⃣ Transfer Funds
    @PostMapping("/transfer")
    public ResponseEntity<?> transferFunds(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody Map<String, String> request
    ) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing token"));
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        String otp = request.get("otp");
        String receiverAccount = request.get("receiverAccount");
        String amountStr = request.get("amount");

        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired OTP"));
        }

        try {
            BigDecimal amount = new BigDecimal(amountStr);
            transactionService.transferFunds(email, receiverAccount, amount);
            return ResponseEntity.ok(Map.of("message", "Transfer Successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 3️⃣ Transaction History
    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getHistory(
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.ok(List.of());
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        List<Transaction> transactions = transactionService.getTransactionHistory(email);

        return ResponseEntity.ok(transactions);
    }

    // 4️⃣ Download PDF
    @GetMapping("/download-pdf")
    public ResponseEntity<InputStreamResource> downloadPdf(
            @RequestHeader(value = "Authorization", required = false) String token
    ) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String email = jwtUtil.extractUsername(token.substring(7));
        List<Transaction> transactions = transactionService.getTransactionHistory(email);

        ByteArrayInputStream bis = pdfService.generateStatement(transactions, email);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=statement.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}
