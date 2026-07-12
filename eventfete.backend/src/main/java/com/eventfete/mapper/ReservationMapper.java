package com.eventfete.mapper;

import com.eventfete.entity.Reservation;
import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.HashMap;

@Component
public class ReservationMapper {

    public Map<String, Object> toResponse(Reservation reservation) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", reservation.getId());
        response.put("salleId", reservation.getSalle().getId());
        response.put("salleNom", reservation.getSalle().getNom());
        response.put("salleVille", reservation.getSalle().getVille());
        response.put("salleAdresse", reservation.getSalle().getAdresse());
        response.put("sallePhoto",
                (reservation.getSalle().getPhotos() != null &&
                        !reservation.getSalle().getPhotos().isEmpty())
                        ? reservation.getSalle().getPhotos().get(0)
                        : null
        );
        response.put("clientNom",
                reservation.getClient().getNom() + " " +
                        reservation.getClient().getPrenom()
        );
        response.put("dateDebut", reservation.getDateDebut());
        response.put("dateFin", reservation.getDateFin());
        response.put("statut", reservation.getStatut());
        response.put("montantTotal", reservation.getMontantTotal());
        response.put("typeEvenement", reservation.getTypeEvenement());
        response.put("nombreInvites", reservation.getNombreInvites());
        response.put("motifAnnulation", reservation.getMotifAnnulation());
        response.put("createdAt", reservation.getCreatedAt());
        return response;
    }
}