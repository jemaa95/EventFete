package com.eventfete.dto.response;

import com.eventfete.enums.KycStatut;
import com.eventfete.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Role role;
    private LocalDateTime createdAt;

    // Pertinent uniquement pour les comptes ROLE_PROPRIO
    private String entreprise;
    private KycStatut kycStatut;
    private List<String> documentsKyc;
    private String motifRejetKyc;
}