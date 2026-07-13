package com.eventfete.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KycRejectRequest {

    @NotBlank(message = "Le motif du rejet est obligatoire")
    private String motif;
}