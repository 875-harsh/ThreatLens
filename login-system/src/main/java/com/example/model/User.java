package com.example.login_system.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")   
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String password;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}