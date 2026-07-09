package com.eventfete.entity;

import com.eventfete.enums.StatutSalle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "salles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Salle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprio_id", nullable = false)
    private User proprietaire;

    @Column(nullable = false)
    private String nom;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String ville;

    private String adresse;

    @Column(name = "prix_jour", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixJour;

    @Column(nullable = false)
    private Integer capacite;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutSalle statut = StatutSalle.EN_ATTENTE;

    @Column(name = "reglement_interieur", length = 1000)
    private String reglementInterieur;

    // Photos stockées sur Cloudinary
    @ElementCollection
    @CollectionTable(name = "salle_photos",
            joinColumns = @JoinColumn(name = "salle_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    private Double note;

    @Column(name = "nb_avis")
    private Integer nbAvis = 0;

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