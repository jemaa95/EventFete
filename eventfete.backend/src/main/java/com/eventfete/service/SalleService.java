package com.eventfete.service;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.Salle;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface SalleService {

    SalleResponse creerSalle(Salle salle, List<MultipartFile> photos, String emailProprio);

    SalleResponse modifierSalle(Long id, Salle salle, String emailProprio);

    void supprimerSalle(Long id, String emailProprio);

    SalleResponse getSalleById(Long id);

    List<SalleResponse> rechercherSalles(String ville, Integer capacite,
                                         String tri, String keyword);

    List<SalleResponse> getSallesByProprio(String emailProprio);

    SalleResponse validerSalle(Long id);

    SalleResponse refuserSalle(Long id);

    List<SalleResponse> getSallesEnAttente();
}