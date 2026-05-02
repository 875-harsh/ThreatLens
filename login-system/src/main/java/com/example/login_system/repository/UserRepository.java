package com.example.login_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.login_system.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}