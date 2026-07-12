package com.eventfete.mapper;

import com.eventfete.dto.response.AuthResponse;
import com.eventfete.dto.response.UserAdminResponse;
import com.eventfete.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public AuthResponse toAuthResponse(User user,
                                       String accessToken,
                                       String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .email(user.getEmail())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .role(user.getRole().name())
                .build();
    }

    public UserAdminResponse toAdminResponse(User user) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .role(user.getRole())
                .actif(user.isActif())
                .entreprise(user.getEntreprise())
                .kycStatut(user.getKycStatut())
                .documentsKyc(user.getDocumentsKyc())
                .motifRejetKyc(user.getMotifRejetKyc())
                .dateSoumissionKyc(user.getDateSoumissionKyc())
                .createdAt(user.getCreatedAt())
                .build();
    }
}