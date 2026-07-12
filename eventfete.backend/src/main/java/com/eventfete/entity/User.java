package com.eventfete.entity;

import com.eventfete.enums.KycStatut;
import com.eventfete.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String telephone;

    private String photo;

    @Column(name = "cin_encrypted")
    private String cinEncrypted;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean actif = true;

    // --- KYC (uniquement pertinent pour les propriétaires ROLE_PROPRIO) ---

    private String entreprise;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_statut")
    @Builder.Default
    private KycStatut kycStatut = KycStatut.NON_SOUMIS;

    @ElementCollection
    @CollectionTable(name = "user_kyc_documents", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "document")
    @Builder.Default
    private List<String> documentsKyc = new ArrayList<>();

    @Column(name = "motif_rejet_kyc")
    private String motifRejetKyc;

    @Column(name = "date_soumission_kyc")
    private LocalDateTime dateSoumissionKyc;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}