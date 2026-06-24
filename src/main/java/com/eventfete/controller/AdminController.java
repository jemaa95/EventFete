package com.eventfete.controller;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.User;
import com.eventfete.repository.UserRepository;
import com.eventfete.service.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final SalleService salleService;
    private final UserRepository userRepository;

    // GET /api/admin/salles/en-attente
    @GetMapping("/salles/en-attente")
    public ResponseEntity<List<SalleResponse>> getSallesEnAttente() {
        return ResponseEntity.ok(
                salleService.rechercherSalles(null, null, null, null)
        );
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
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // PUT /api/admin/users/{id}/bloquer
    @PutMapping("/users/{id}/bloquer")
    public ResponseEntity<String> bloquerUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow();
        user.setActif(false);
        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur bloqué avec succès");
    }

    // PUT /api/admin/users/{id}/activer
    @PutMapping("/users/{id}/activer")
    public ResponseEntity<String> activerUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow();
        user.setActif(true);
        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur activé avec succès");
    }
}