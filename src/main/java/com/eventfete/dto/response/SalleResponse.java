package com.eventfete.dto.response;

import com.eventfete.enums.StatutSalle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalleResponse {

    private Long id;
    private String nom;
    private String description;
    private String ville;
    private String adresse;
    private BigDecimal prixJour;
    private Integer capacite;
    private Double latitude;
    private Double longitude;
    private StatutSalle statut;
    private List<String> photos;
    private Double note;
    private Integer nbAvis;
    private String nomProprietaire;
}