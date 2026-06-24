package com.eventfete.controller;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.Salle;
import com.eventfete.service.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalleController {

    private final SalleService salleService;

    // GET /api/salles/search?ville=Casablanca&capacite=100&tri=prix
    @GetMapping("/search")
    public ResponseEntity<List<SalleResponse>> rechercher(
            @RequestParam(required = false) String ville,
            @RequestParam(required = false) Integer capacite,
            @RequestParam(required = false) String tri,
            @RequestParam(required = false) String keyword) {

        List<SalleResponse> salles = salleService.rechercherSalles(
                ville, capacite, tri, keyword
        );
        return ResponseEntity.ok(salles);
    }

    // GET /api/salles/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SalleResponse> getSalle(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.getSalleById(id));
    }

    // POST /api/salles — Propriétaire uniquement
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<SalleResponse> creerSalle(
            @RequestPart("salle") Salle salle,
            @RequestPart("photos") List<MultipartFile> photos,
            Authentication authentication) {

        SalleResponse response = salleService.creerSalle(
                salle, photos, authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/salles/{id} — Propriétaire uniquement
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<SalleResponse> modifierSalle(
            @PathVariable Long id,
            @RequestBody Salle salle,
            Authentication authentication) {

        SalleResponse response = salleService.modifierSalle(
                id, salle, authentication.getName()
        );
        return ResponseEntity.ok(response);
    }

    // DELETE /api/salles/{id} — Propriétaire uniquement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<String> supprimerSalle(
            @PathVariable Long id,
            Authentication authentication) {

        salleService.supprimerSalle(id, authentication.getName());
        return ResponseEntity.ok("Salle supprimée avec succès");
    }

    // GET /api/salles/mes-salles — Propriétaire uniquement
    @GetMapping("/mes-salles")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<List<SalleResponse>> getMesSalles(
            Authentication authentication) {

        return ResponseEntity.ok(
                salleService.getSallesByProprio(authentication.getName())
        );
    }
}