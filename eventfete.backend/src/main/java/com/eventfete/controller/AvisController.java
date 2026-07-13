package com.eventfete.controller;

import com.eventfete.dto.request.AvisReponseRequest;
import com.eventfete.dto.request.AvisRequest;
import com.eventfete.dto.response.AvisResponse;
import com.eventfete.service.AvisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AvisController {

    private final AvisService avisService;

    // POST /api/avis — dépôt d'un avis (réservation CONFIRMEE + terminée requise)
    @PostMapping("/avis")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<AvisResponse> creerAvis(
            @Valid @RequestBody AvisRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                avisService.creerAvis(request, authentication.getName())
        );
    }

    // GET /api/salles/{id}/avis — public
    @GetMapping("/salles/{id}/avis")
    public ResponseEntity<List<AvisResponse>> getAvisBySalle(@PathVariable Long id) {
        return ResponseEntity.ok(avisService.getAvisBySalle(id));
    }

    // POST /api/avis/{id}/reponse — droit de réponse du propriétaire (une seule fois)
    @PostMapping("/avis/{id}/reponse")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<AvisResponse> repondre(
            @PathVariable Long id,
            @Valid @RequestBody AvisReponseRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                avisService.repondre(id, request, authentication.getName())
        );
    }
}