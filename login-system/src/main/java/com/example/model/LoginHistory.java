package com.example.login_system.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class LoginHistory {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String ipAddress;
    private LocalDateTime loginTime;
    private boolean suspicious;

    private int riskScore;     
    private String location;   

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getLoginTime() { return loginTime; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }

    public boolean isSuspicious() { return suspicious; }
    public void setSuspicious(boolean suspicious) { this.suspicious = suspicious; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}