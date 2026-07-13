package com.eventfete.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvisResponse {
    private Long id;
    private Long salleId;
    private String clientNom;
    private Integer note;
    private String commentaire;
    private String reponseProprio;
    private LocalDateTime createdAt;
}