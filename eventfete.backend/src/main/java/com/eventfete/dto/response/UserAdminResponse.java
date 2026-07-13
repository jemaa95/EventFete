package com.eventfete.dto.response;

import com.eventfete.enums.KycStatut;
import com.eventfete.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

// ⚠️ DTO utilisé pour toutes les listes/consultations côté admin.
// Ne JAMAIS retourner l'entité User brute (elle contient le hash du mot de
// passe et le CIN chiffré) : ce DTO garantit qu'on n'expose que des champs sûrs.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Role role;
    private boolean actif;
    private String entreprise;
    private KycStatut kycStatut;
    private List<String> documentsKyc;
    private String motifRejetKyc;
    private LocalDateTime dateSoumissionKyc;
    private LocalDateTime createdAt;
}