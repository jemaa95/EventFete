package com.eventfete.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class KycSubmissionRequest {

    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    private String entreprise;

    @NotEmpty(message = "Au moins un document est requis")
    private List<String> documents; // ex: "Carte d'identité", "Licence commerciale", "Certificat fiscal"
}