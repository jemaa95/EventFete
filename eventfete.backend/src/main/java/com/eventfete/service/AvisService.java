package com.eventfete.service;

import com.eventfete.dto.request.AvisReponseRequest;
import com.eventfete.dto.request.AvisRequest;
import com.eventfete.dto.response.AvisResponse;
import java.util.List;

public interface AvisService {

    AvisResponse creerAvis(AvisRequest request, String emailClient);

    List<AvisResponse> getAvisBySalle(Long salleId);

    AvisResponse repondre(Long avisId, AvisReponseRequest request, String emailProprio);
}