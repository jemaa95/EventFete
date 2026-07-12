package com.eventfete.controller;

import com.eventfete.dto.request.KycRejectRequest;
import com.eventfete.dto.response.SalleResponse;
import com.eventfete.dto.response.UserAdminResponse;
import com.eventfete.entity.User;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.UserMapper;
import com.eventfete.repository.UserRepository;
import com.eventfete.service.KycService;
import com.eventfete.service.SalleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final SalleService salleService;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final KycService kycService;

    // GET /api/admin/salles/en-attente
    @GetMapping("/salles/en-attente")
    public ResponseEntity<List<SalleResponse>> getSallesEnAttente() {
        return ResponseEntity.ok(salleService.getSallesEnAttente());
    }

    // PUT /api/admin/salles/{id}/valider
    @PutMapping("/salles/{id}/valider")
    public ResponseEntity<SalleResponse> validerSalle(
            @PathVariable Long id) {
        return ResponseEntity.ok(salleService.validerSalle(id));
    }

    // PUT /api/admin/salles/{id}/refuser
    @PutMapping("/salles/{id}/refuser")
    public ResponseEntity<SalleResponse> refuserSalle(
            @PathVariable Long id) {
        return ResponseEntity.ok(salleService.refuserSalle(id));
    }

    // GET /api/admin/users
    // ⚠️ Renvoie désormais un DTO (UserAdminResponse), jamais l'entité User
    // brute : celle-ci contient le hash du mot de passe et le CIN chiffré.
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        List<UserAdminResponse> users = userRepository.findAll().stream()
                .map(userMapper::toAdminResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // PUT /api/admin/users/{id}/bloquer
    @PutMapping("/users/{id}/bloquer")
    public ResponseEntity<String> bloquerUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        user.setActif(false);
        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur bloqué avec succès");
    }

    // PUT /api/admin/users/{id}/activer
    @PutMapping("/users/{id}/activer")
    public ResponseEntity<String> activerUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        user.setActif(true);
        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur activé avec succès");
    }

    // --- KYC des propriétaires ---

    // GET /api/admin/kyc — toutes les demandes soumises (en attente, approuvées, rejetées)
    @GetMapping("/kyc")
    public ResponseEntity<List<UserAdminResponse>> getDemandesKyc() {
        return ResponseEntity.ok(kycService.listerToutesLesDemandes());
    }

    // PUT /api/admin/kyc/{userId}/approuver
    @PutMapping("/kyc/{userId}/approuver")
    public ResponseEntity<UserAdminResponse> approuverKyc(@PathVariable Long userId) {
        return ResponseEntity.ok(kycService.approuver(userId));
    }

    // PUT /api/admin/kyc/{userId}/rejeter
    @PutMapping("/kyc/{userId}/rejeter")
    public ResponseEntity<UserAdminResponse> rejeterKyc(
            @PathVariable Long userId,
            @Valid @RequestBody KycRejectRequest request) {
        return ResponseEntity.ok(kycService.rejeter(userId, request));
    }
}