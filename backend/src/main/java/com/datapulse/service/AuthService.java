package com.datapulse.service;

import com.datapulse.domain.User;
import com.datapulse.domain.enums.Role;
import com.datapulse.repository.UserRepository;
import com.datapulse.security.JwtService;
import com.datapulse.web.dto.AuthResponse;
import com.datapulse.web.dto.LoginRequest;
import com.datapulse.web.dto.RegisterRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email zaten kullanımda!");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(deriveNameFromEmail(request.getEmail()));
        user.setRoleType(request.getRoleType() != null ? request.getRoleType() : Role.INDIVIDUAL);
        user.setIsActive(true);

        userRepository.save(user);

        String token = jwtService.generateAccessToken(user);
        String name = deriveNameFromEmail(user.getEmail());
        return new AuthResponse(token, "Kayıt başarılı", user.getEmail(), name, user.getRoleType().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String token = jwtService.generateAccessToken(user);
        String name = deriveNameFromEmail(user.getEmail());
        return new AuthResponse(token, "Giriş başarılı", user.getEmail(), name, user.getRoleType().name());
    }

    private String deriveNameFromEmail(String email) {
        String localPart = email.split("@")[0];
        String[] parts = localPart.replace(".", " ").replace("_", " ").split(" ");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                sb.append(Character.toUpperCase(part.charAt(0)))
                  .append(part.substring(1).toLowerCase())
                  .append(" ");
            }
        }
        return sb.toString().trim();
    }
}
