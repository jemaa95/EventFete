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
        response.put("clientNom",
                reservation.getClient().getNom() + " " +
                        reservation.getClient().getPrenom()
        );
        response.put("dateDebut", reservation.getDateDebut());
        response.put("dateFin", reservation.getDateFin());
        response.put("statut", reservation.getStatut());
        response.put("montantTotal", reservation.getMontantTotal());
        response.put("createdAt", reservation.getCreatedAt());
        return response;
    }
}