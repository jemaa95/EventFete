package com.eventfete.repository;

import com.eventfete.entity.Avis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {

    // Avis publics d'une salle (hors quarantaine), plus récents en premier
    List<Avis> findBySalleIdAndEnQuarantaineFalseOrderByCreatedAtDesc(Long salleId);

    // RG-AVIS-02 : un seul avis par réservation
    boolean existsByReservationId(Long reservationId);

    Optional<Avis> findByReservationId(Long reservationId);
}