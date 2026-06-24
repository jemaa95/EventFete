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
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE " +
            "r.salle.id = :salleId AND " +
            "r.statut = 'CONFIRMEE' AND " +
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
}