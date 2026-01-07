package com.login.loginBackend.controller;

import com.login.loginBackend.service.JwtUtil;
import com.login.loginBackend.service.StockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {

    private static final Logger logger = LoggerFactory.getLogger(StockController.class);

    @Autowired
    private StockService stockService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/buy")
    public ResponseEntity<?> buyStock(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, Object> request
    ) {
        try {
            // 🔐 Extract EMAIL from JWT
            String email = jwtUtil.extractUsername(token.substring(7));

            String symbol = request.get("symbol").toString();
            int quantity = Integer.parseInt(request.get("quantity").toString());
            BigDecimal price = new BigDecimal(request.get("price").toString());

            logger.info(
                "BUY STOCK | Email: {} | Symbol: {} | Qty: {} | Price: {}",
                email, symbol, quantity, price
            );

            // 🚀 Pass EMAIL (not username)
            stockService.buyStock(email, symbol, quantity, price);

            return ResponseEntity.ok(
                Map.of("message", "Stock purchased successfully")
            );

        } catch (NumberFormatException e) {
            logger.error("Invalid quantity or price", e);
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Invalid quantity or price"));

        } catch (RuntimeException e) {
            logger.warn("Stock purchase failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            logger.error("Unexpected error during stock purchase", e);
            return ResponseEntity
                    .internalServerError()
                    .body(Map.of("message", "Something went wrong"));
        }
    }
}
