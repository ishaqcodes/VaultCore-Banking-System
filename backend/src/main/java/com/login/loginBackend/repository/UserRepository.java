package com.login.loginBackend.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.login.loginBackend.model.User;
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
