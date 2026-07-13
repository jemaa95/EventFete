package com.eventfete.mapper;

import com.eventfete.dto.response.AvisResponse;
import com.eventfete.entity.Avis;
import org.springframework.stereotype.Component;

@Component
public class AvisMapper {

    public AvisResponse toResponse(Avis avis) {
        return AvisResponse.builder()
                .id(avis.getId())
                .salleId(avis.getSalle().getId())
                .clientNom(avis.getClient().getPrenom() + " " + avis.getClient().getNom())
                .note(avis.getNote())
                .commentaire(avis.getCommentaire())
                .reponseProprio(avis.getReponseProprio())
                .createdAt(avis.getCreatedAt())
                .build();
    }
}