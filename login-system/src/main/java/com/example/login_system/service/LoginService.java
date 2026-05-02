package com.example.login_system.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.login_system.model.LoginHistory;
import com.example.login_system.model.User;
import com.example.login_system.repository.LoginHistoryRepository;
import com.example.login_system.repository.UserRepository;

@Service
public class LoginService {

    private final LoginHistoryRepository repo;
    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;
    private final RestTemplate restTemplate;

    public LoginService(LoginHistoryRepository repo,
                        UserRepository userRepo,
                        BCryptPasswordEncoder encoder,
                        RestTemplate restTemplate) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.restTemplate = restTemplate;
    }

    public boolean validateUser(String username, String password) {
        User user = userRepo.findByUsername(username);
        if (user == null) return false;
        return encoder.matches(password, user.getPassword());
    }

    public int calculateRiskScore(String username, String ip) {
        List<LoginHistory> history = repo.findByUsername(username);

        int score = 0;

        if (history.size() < 2) {
            return 0;
        }

        boolean newIp = history.stream()
                .noneMatch(h -> h.getIpAddress().equals(ip));

        int hour = LocalDateTime.now().getHour();
        boolean oddTime = (hour < 6 || hour > 22);

        boolean frequent = history.size() >= 3;

        if (history.size() == 2 && newIp) score += 50;
        if (history.size() >= 3 && newIp) score += 70;
        if (frequent) score += 40;
        if (newIp && oddTime) score += 30;

        return score;
    }

    private String getLocation(String ip) {

        if (ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return "Localhost";
        }

        try {
            String url = "http://ip-api.com/json/" + ip;
            Map<String, Object> response =
                    restTemplate.getForObject(url, Map.class);

            if (response != null) {
                String country = String.valueOf(response.get("country"));
                String city = String.valueOf(response.get("city"));

                if ("United States".equalsIgnoreCase(country)) {
                    return "Unknown Region";
                }

                return country + ", " + city;
            }

        } catch (Exception e) {
            return "Unknown";
        }

        return "Unknown";
    }

    public LoginHistory saveLogin(String username, String ip) {
        LoginHistory log = new LoginHistory();

        log.setUsername(username);
        log.setIpAddress(ip);
        log.setLoginTime(LocalDateTime.now());

        int score = calculateRiskScore(username, ip);
        log.setRiskScore(score);
        log.setSuspicious(score >= 40);

        String location = getLocation(ip);
        log.setLocation(location);

        return repo.save(log);
    }

    public List<LoginHistory> getAll() {
        return repo.findAll();
    }
}