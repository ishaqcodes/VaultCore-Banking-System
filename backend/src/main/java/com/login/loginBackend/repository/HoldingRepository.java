package com.login.loginBackend.repository;

import com.login.loginBackend.model.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {
    Optional<Holding> findByUserIdAndStockSymbol(Long userId, String stockSymbol);
}