package com.login.loginBackend.config;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Aspect responsible for capturing audit logs for critical financial transactions.
 * This ensures compliance by recording successful fund transfers.
 */
@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    /**
     * Intercepts the transferFunds method after a successful execution
     * to record the transaction initiator.
     */
    @AfterReturning(
        pointcut = "execution(* com.login.loginBackend.service.TransactionService.transferFunds(..))", 
        returning = "result"
    )
    public void logAfterTransfer(JoinPoint joinPoint, Object result) {
        Object[] args = joinPoint.getArgs();

        // Ensure arguments exist before accessing index 0
        if (args != null && args.length > 0) {
            String initiator = (String) args[0];
            
            logger.info("AUDIT EVENT | Action: Fund Transfer | Status: SUCCESS | Initiator: {}", initiator);
        }
    }
}