package com.eventfete.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AvisReponseRequest {

    @NotBlank(message = "La réponse ne peut pas être vide")
    private String reponse;
}