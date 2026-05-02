package com.example.login_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;

import com.example.login_system.model.User;
import com.example.login_system.repository.UserRepository;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class LoginSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoginSystemApplication.class, args);
    }
    @Bean
    CommandLineRunner run(UserRepository repo, BCryptPasswordEncoder encoder) {
        return args -> {
            User u = new User();
            u.setUsername("harsh");
            u.setPassword(encoder.encode("1234"));
            repo.save(u);
        };
    }
}