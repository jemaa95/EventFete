package com.eventfete.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReservationRequest {

    @NotNull(message = "L'identifiant de la salle est obligatoire")
    private Long salleId;

    @NotNull(message = "La date de début est obligatoire")
    @Future(message = "La date de début doit être dans le futur")
    private LocalDateTime dateDebut;

    @NotNull(message = "La date de fin est obligatoire")
    @Future(message = "La date de fin doit être dans le futur")
    private LocalDateTime dateFin;

    @NotBlank(message = "Le mode de paiement est obligatoire")
    private String modePaiement; // CARTE, VIREMENT, SUR_PLACE
}