package com.example.login_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.example.login_system.model.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    List<LoginHistory> findByUsername(String username);
}