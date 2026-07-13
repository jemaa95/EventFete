package com.eventfete.service;

import com.eventfete.dto.request.KycRejectRequest;
import com.eventfete.dto.request.KycSubmissionRequest;
import com.eventfete.dto.response.UserAdminResponse;
import java.util.List;

public interface KycService {

    // Côté propriétaire
    UserAdminResponse soumettreKyc(String email, KycSubmissionRequest request);

    // Côté admin
    List<UserAdminResponse> listerToutesLesDemandes();

    UserAdminResponse approuver(Long userId);

    UserAdminResponse rejeter(Long userId, KycRejectRequest request);
}