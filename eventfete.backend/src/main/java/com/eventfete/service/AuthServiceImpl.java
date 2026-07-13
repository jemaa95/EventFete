package com.eventfete.service;

import com.eventfete.dto.request.LoginRequest;
import com.eventfete.dto.request.RegisterRequest;
import com.eventfete.dto.response.AuthResponse;
import com.eventfete.entity.User;
import com.eventfete.enums.Role;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.UserMapper;
import com.eventfete.repository.UserRepository;
import com.eventfete.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        // Vérifier si email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(
                    "Un compte existe déjà avec l'email : " + request.getEmail()
            );
        }

        // Créer l'utilisateur
        User user = User.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .telephone(request.getTelephone())
                .role(Role.valueOf(request.getRole()))
                .actif(true)
                .build();

        userRepository.save(user);

        // Email de bienvenue envoyé de façon asynchrone : n'impacte pas le
        // temps de réponse de l'inscription, et une erreur SMTP éventuelle
        // (ex: identifiants Gmail non configurés) ne fait pas échouer l'inscription.
        emailService.envoyerEmailBienvenue(user.getEmail(), user.getPrenom());

        // Générer les tokens
        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name()
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return userMapper.toAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        // Authentifier via Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Récupérer l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur non trouvé"
                ));

        // Vérifier si compte actif
        if (!user.isActif()) {
            throw new BadCredentialsException("Compte désactivé");
        }

        // Générer les tokens
        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name()
        );
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return userMapper.toAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {

        // Valider le refresh token
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new BadCredentialsException("Refresh token invalide");
        }

        String email = jwtUtil.extractEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Utilisateur non trouvé"
                ));

        // Générer nouveau access token
        String newAccessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name()
        );
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return userMapper.toAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Override
    public void logout(String token) {
        // Pour V1 : le logout est géré côté client
        // En V2 on ajoutera une blacklist Redis
    }
}