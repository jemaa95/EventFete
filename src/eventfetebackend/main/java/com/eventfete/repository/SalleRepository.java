package com.eventfete.repository;

import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutSalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalleRepository extends JpaRepository<Salle, Long> {

    // Recherche par ville
    List<Salle> findByVilleAndStatut(String ville, StatutSalle statut);

    // Salles d'un propriétaire
    List<Salle> findByProprietaire(User proprietaire);

    // Salles validées uniquement
    List<Salle> findByStatut(StatutSalle statut);

    // Recherche par ville et capacité minimale
    List<Salle> findByVilleAndCapaciteGreaterThanEqualAndStatut(
            String ville, Integer capacite, StatutSalle statut);

    // Recherche par prix croissant
    List<Salle> findByVilleAndStatutOrderByPrixJourAsc(
            String ville, StatutSalle statut);

    // Recherche par note décroissante
    List<Salle> findByVilleAndStatutOrderByNoteDesc(
            String ville, StatutSalle statut);

    // Recherche fulltext nom ou description
    @Query("SELECT s FROM Salle s WHERE " +
            "(LOWER(s.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND s.statut = :statut")
    List<Salle> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("statut") StatutSalle statut);
}