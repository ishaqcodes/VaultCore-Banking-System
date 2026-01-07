package com.login.loginBackend.service;

import com.login.loginBackend.model.*;
import com.login.loginBackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class StockService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    @Transactional
    public void buyStock(String email, String symbol, int quantity, BigDecimal price) {

        // 1️⃣ Validate input
        if (quantity <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid stock quantity or price.");
        }

        // 2️⃣ Fetch user by EMAIL
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // 3️⃣ Fetch account
        Account account = accountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Account not found."));

        BigDecimal totalCost = price.multiply(BigDecimal.valueOf(quantity));

        // 4️⃣ Check balance
        if (account.getCurrentBalance().compareTo(totalCost) < 0) {
            throw new RuntimeException(
                    "Insufficient funds. Required: " + totalCost +
                    ", Available: " + account.getCurrentBalance()
            );
        }

        // 5️⃣ Deduct balance
        account.setCurrentBalance(account.getCurrentBalance().subtract(totalCost));
        accountRepository.save(account);

        // 6️⃣ Update holdings
        Holding holding = holdingRepository
                .findByUserIdAndStockSymbol(user.getId(), symbol)
                .orElse(null);

        if (holding == null) {
            holding = new Holding();
            holding.setUserId(user.getId());
            holding.setStockSymbol(symbol);
            holding.setQuantity(quantity);
            holding.setAvgBuyPrice(price);
        } else {
            BigDecimal oldTotal =
                    holding.getAvgBuyPrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal newTotal = oldTotal.add(totalCost);

            int newQty = holding.getQuantity() + quantity;

            holding.setQuantity(newQty);
            holding.setAvgBuyPrice(
                    newTotal.divide(BigDecimal.valueOf(newQty), 2, BigDecimal.ROUND_HALF_UP)
            );
        }

        holdingRepository.save(holding);

        // 7️⃣ Log transaction (🔥 FIXED PART 🔥)
        Transaction txn = new Transaction();
        txn.setSenderAccountId(account.getId());
        txn.setReceiverAccountId(account.getId()); // ⭐ CRITICAL FIX
        txn.setAmount(totalCost);
        txn.setStatus("STOCK_BUY : " + symbol + " | Qty: " + quantity);
        txn.setTimestamp(LocalDateTime.now());

        transactionRepository.save(txn);
    }
}
