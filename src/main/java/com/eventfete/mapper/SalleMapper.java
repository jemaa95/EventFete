package com.eventfete.mapper;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.Salle;
import org.springframework.stereotype.Component;

@Component
public class SalleMapper {

    public SalleResponse toResponse(Salle salle) {
        return SalleResponse.builder()
                .id(salle.getId())
                .nom(salle.getNom())
                .description(salle.getDescription())
                .ville(salle.getVille())
                .adresse(salle.getAdresse())
                .prixJour(salle.getPrixJour())
                .capacite(salle.getCapacite())
                .latitude(salle.getLatitude())
                .longitude(salle.getLongitude())
                .statut(salle.getStatut())
                .photos(salle.getPhotos())
                .note(salle.getNote())
                .nbAvis(salle.getNbAvis())
                .nomProprietaire(
                        salle.getProprietaire().getNom() + " " +
                                salle.getProprietaire().getPrenom()
                )
                .build();
    }
}