package com.eventfete.service;

import com.eventfete.dto.request.ReservationRequest;
import java.util.List;
import java.util.Map;

public interface ReservationService {

    Map<String, Object> creerReservation(ReservationRequest request,
                                         String emailClient);

    Map<String, Object> annulerReservation(Long id, String emailClient);

    List<Map<String, Object>> getMesReservations(String emailClient);

    List<Map<String, Object>> getReservationsProprio(String emailProprio);

    Map<String, Object> getReservationById(Long id);
}