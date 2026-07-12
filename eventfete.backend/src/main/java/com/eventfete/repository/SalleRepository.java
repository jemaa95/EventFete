package com.eventfete.repository;

import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutSalle;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {

    // Salles d'un propriétaire
    List<Salle> findByProprietaire(User proprietaire);

    // Salles validées uniquement
    List<Salle> findByStatut(StatutSalle statut);

    // Recherche flexible : ville et capacité sont optionnels.
    // ⚠️ On évite volontairement une requête unique du type
    // "AND (:ville IS NULL OR ...)" : PostgreSQL ne parvient pas toujours à
    // déduire le type d'un paramètre bindé à NULL dans ce contexte et lève
    // "could not determine data type of parameter" (erreur 500). On utilise
    // donc des méthodes dédiées selon les filtres réellement fournis.
    List<Salle> findByStatutAndVilleContainingIgnoreCaseAndCapaciteGreaterThanEqual(
            StatutSalle statut, String ville, Integer capacite, Sort sort);

    List<Salle> findByStatutAndVilleContainingIgnoreCase(
            StatutSalle statut, String ville, Sort sort);

    List<Salle> findByStatutAndCapaciteGreaterThanEqual(
            StatutSalle statut, Integer capacite, Sort sort);

    List<Salle> findByStatut(StatutSalle statut, Sort sort);

    // Recherche fulltext nom ou description
    @Query("SELECT s FROM Salle s WHERE " +
            "(LOWER(s.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND s.statut = :statut")
    List<Salle> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("statut") StatutSalle statut);
}