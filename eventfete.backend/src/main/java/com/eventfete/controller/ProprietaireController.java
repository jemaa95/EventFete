package com.eventfete.controller;

import com.eventfete.dto.request.KycSubmissionRequest;
import com.eventfete.dto.response.UserAdminResponse;
import com.eventfete.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proprietaire")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasAuthority('ROLE_PROPRIO')")
public class ProprietaireController {

    private final KycService kycService;

    // POST /api/proprietaire/kyc — soumission (ou re-soumission après rejet) du dossier KYC
    @PostMapping("/kyc")
    public ResponseEntity<UserAdminResponse> soumettreKyc(
            @Valid @RequestBody KycSubmissionRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                kycService.soumettreKyc(authentication.getName(), request)
        );
    }
}