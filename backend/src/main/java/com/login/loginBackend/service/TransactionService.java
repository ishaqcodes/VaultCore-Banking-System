package com.login.loginBackend.service;

import com.login.loginBackend.model.*;
import com.login.loginBackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void transferFunds(String senderEmail, String receiverAccNo, BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero.");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender user not found"));

        Account senderAcc = accountRepository.findByUserId(sender.getId())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account receiverAcc = accountRepository.findByAccountNumber(receiverAccNo)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (senderAcc.getId().equals(receiverAcc.getId())) {
            throw new RuntimeException("Cannot transfer funds to the same account.");
        }

        if (senderAcc.getCurrentBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient Funds for this transfer.");
        }

        senderAcc.setCurrentBalance(senderAcc.getCurrentBalance().subtract(amount));
        receiverAcc.setCurrentBalance(receiverAcc.getCurrentBalance().add(amount));

        accountRepository.save(senderAcc);
        accountRepository.save(receiverAcc);

        Transaction txn = new Transaction();
        txn.setSenderAccountId(senderAcc.getId());
        txn.setReceiverAccountId(receiverAcc.getId());
        txn.setAmount(amount);
        txn.setStatus("TRANSFER_SUCCESS");
        txn.setTimestamp(LocalDateTime.now());

        transactionRepository.save(txn);
    }

    // 🔥 FIXED METHOD
    public List<Transaction> getTransactionHistory(String email) {

        // If user does not exist → return empty list
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        // If account does not exist → return empty list
        Account account = accountRepository.findByUserId(user.getId()).orElse(null);
        if (account == null) {
            return List.of();
        }

        // If no transactions → repository already returns empty list
        return transactionRepository
                .findBySenderAccountIdOrReceiverAccountIdOrderByTimestampDesc(
                        account.getId(),
                        account.getId()
                );
    }
}
