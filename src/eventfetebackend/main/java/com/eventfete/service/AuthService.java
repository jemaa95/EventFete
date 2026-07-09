package com.eventfete.service;

import com.eventfete.dto.request.LoginRequest;
import com.eventfete.dto.request.RegisterRequest;
import com.eventfete.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshToken(String refreshToken);

    void logout(String token);
}