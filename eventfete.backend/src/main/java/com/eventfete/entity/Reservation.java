package com.eventfete.entity;

import com.eventfete.enums.StatutReservation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"salle_id", "date_debut", "date_fin"},
                        name = "unique_creneau"
                )
        })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salle_id", nullable = false)
    private Salle salle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User client;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin", nullable = false)
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutReservation statut = StatutReservation.EN_COURS;

    @Column(name = "montant_total", precision = 10, scale = 2)
    private BigDecimal montantTotal;

    // Champs collectés lors du tunnel de réservation (étape "Informations")
    @Column(name = "type_evenement")
    private String typeEvenement;

    @Column(name = "nombre_invites")
    private Integer nombreInvites;

    private String entreprise;

    @Column(name = "informations_complementaires", length = 1000)
    private String informationsComplementaires;

    @Column(name = "motif_annulation")
    private String motifAnnulation;

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