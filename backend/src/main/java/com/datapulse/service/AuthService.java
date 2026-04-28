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

    // Lombok çalışmadığı için Constructor'ı (bağlayıcıyı) elimizle yazıyoruz
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
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
        user.setRoleType(request.getRoleType() != null ? request.getRoleType() : Role.INDIVIDUAL);
        user.setIsActive(true);

        userRepository.save(user);

        String token = jwtService.generateAccessToken(user);
        return new AuthResponse(token, "Kayıt başarılı");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        String token = jwtService.generateAccessToken(user);
        return new AuthResponse(token, "Giriş başarılı");
    }
}