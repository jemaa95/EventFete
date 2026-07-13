package com.eventfete.controller;

import com.eventfete.dto.request.ReservationRequest;
import com.eventfete.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    // POST /api/reservations — Client uniquement
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<Map<String, Object>> creerReservation(
            @Valid @RequestBody ReservationRequest request,
            Authentication authentication) {

        Map<String, Object> response = reservationService.creerReservation(
                request, authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // DELETE /api/reservations/{id} — Client uniquement
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<Map<String, Object>> annulerReservation(
            @PathVariable Long id,
            Authentication authentication) {

        Map<String, Object> response = reservationService.annulerReservation(
                id, authentication.getName()
        );
        return ResponseEntity.ok(response);
    }

    // GET /api/reservations/mes-reservations — Client uniquement
    @GetMapping("/mes-reservations")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    public ResponseEntity<List<Map<String, Object>>> getMesReservations(
            Authentication authentication) {

        return ResponseEntity.ok(
                reservationService.getMesReservations(authentication.getName())
        );
    }

    // GET /api/reservations/proprio — Propriétaire uniquement
    @GetMapping("/proprio")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<List<Map<String, Object>>> getReservationsProprio(
            Authentication authentication) {

        return ResponseEntity.ok(
                reservationService.getReservationsProprio(authentication.getName())
        );
    }

    // PUT /api/reservations/{id}/accepter — Propriétaire uniquement
    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<Map<String, Object>> accepterReservation(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                reservationService.accepterReservation(id, authentication.getName())
        );
    }

    // PUT /api/reservations/{id}/refuser-proprio — Propriétaire uniquement
    @PutMapping("/{id}/refuser-proprio")
    @PreAuthorize("hasAuthority('ROLE_PROPRIO')")
    public ResponseEntity<Map<String, Object>> refuserReservationProprio(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String motif = body != null ? body.get("motif") : null;
        return ResponseEntity.ok(
                reservationService.refuserReservationProprio(id, authentication.getName(), motif)
        );
    }

    // GET /api/reservations/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_PROPRIO', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getReservation(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                reservationService.getReservationById(id)
        );
    }
}