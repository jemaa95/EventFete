package com.eventfete.controller;

import com.eventfete.dto.request.ChangePasswordRequest;
import com.eventfete.dto.request.UpdateProfileRequest;
import com.eventfete.dto.response.UserProfileResponse;
import com.eventfete.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // GET /api/users/me — profil de l'utilisateur connecté
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    // PUT /api/users/me — mise à jour du profil
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                userService.updateProfile(authentication.getName(), request)
        );
    }

    // PUT /api/users/me/password — changement de mot de passe
    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        userService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok("Mot de passe modifié avec succès");
    }
}