package com.eventfete.repository;

import com.eventfete.entity.Reservation;
import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Réservations d'un client
    List<Reservation> findByClient(User client);

    // Réservations d'une salle
    List<Reservation> findBySalle(Salle salle);

    // Réservations par statut
    List<Reservation> findByClientAndStatut(User client, StatutReservation statut);

    // Vérifier conflit de créneau (RG-01)
    // ⚠️ Doit inclure EN_COURS ET CONFIRMEE : tant qu'une réservation est en
    // attente d'acceptation par le propriétaire, le créneau doit rester bloqué
    // pour éviter qu'un autre client ne réserve le même créneau entre-temps.
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE " +
            "r.salle.id = :salleId AND " +
            "r.statut IN ('EN_COURS', 'CONFIRMEE') AND " +
            "r.dateDebut < :dateFin AND " +
            "r.dateFin > :dateDebut")
    boolean existsConflict(
            @Param("salleId") Long salleId,
            @Param("dateDebut") LocalDateTime dateDebut,
            @Param("dateFin") LocalDateTime dateFin);

    // Réservations confirmées d'un propriétaire
    @Query("SELECT r FROM Reservation r WHERE " +
            "r.salle.proprietaire.id = :proprioId AND " +
            "r.statut = :statut")
    List<Reservation> findByProprioAndStatut(
            @Param("proprioId") Long proprioId,
            @Param("statut") StatutReservation statut);

    // Toutes les réservations d'un propriétaire (tous statuts confondus)
    @Query("SELECT r FROM Reservation r WHERE r.salle.proprietaire.id = :proprioId")
    List<Reservation> findByProprio(@Param("proprioId") Long proprioId);

    // IDs des salles indisponibles sur une journée donnée (utilisé par la
    // recherche publique avec filtre de date) : toute réservation EN_COURS ou
    // CONFIRMEE qui chevauche la journée rend la salle indisponible ce jour-là.
    @Query("SELECT DISTINCT r.salle.id FROM Reservation r WHERE " +
            "r.statut IN ('EN_COURS', 'CONFIRMEE') AND " +
            "r.dateDebut < :finJournee AND r.dateFin > :debutJournee")
    List<Long> findSalleIdsIndisponibles(
            @Param("debutJournee") LocalDateTime debutJournee,
            @Param("finJournee") LocalDateTime finJournee);
}