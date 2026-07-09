package com.eventfete.service;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutSalle;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.SalleMapper;
import com.eventfete.repository.SalleRepository;
import com.eventfete.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalleServiceImpl implements SalleService {

    private final SalleRepository salleRepository;
    private final UserRepository userRepository;
    private final SalleMapper salleMapper;

    @Override
    public SalleResponse creerSalle(Salle salle,
                                    List<MultipartFile> photos,
                                    String emailProprio) {

        // Vérifier minimum 3 photos (RG-10)
        if (photos == null || photos.size() < 3) {
            throw new ConflictException(
                    "Minimum 3 photos requises pour publier une annonce"
            );
        }

        // Vérifier description > 100 caractères (RG-10)
        if (salle.getDescription() == null ||
                salle.getDescription().length() < 100) {
            throw new ConflictException(
                    "La description doit contenir au moins 100 caractères"
            );
        }

        // Récupérer le propriétaire
        User proprio = userRepository.findByEmail(emailProprio)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Propriétaire non trouvé"
                ));

        // Simuler upload photos (V1 - URLs fictives)
        // En V2 : intégration Cloudinary
        List<String> photoUrls = new ArrayList<>();
        for (int i = 0; i < photos.size(); i++) {
            photoUrls.add("https://res.cloudinary.com/eventfete/photo_" + i);
        }

        salle.setProprietaire(proprio);
        salle.setPhotos(photoUrls);
        salle.setStatut(StatutSalle.EN_ATTENTE);
        salle.setNbAvis(0);

        Salle saved = salleRepository.save(salle);
        return salleMapper.toResponse(saved);
    }

    @Override
    public SalleResponse modifierSalle(Long id,
                                       Salle salleData,
                                       String emailProprio) {

        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));

        // Vérifier que c'est bien le propriétaire
        if (!salle.getProprietaire().getEmail().equals(emailProprio)) {
            throw new ConflictException(
                    "Vous n'êtes pas autorisé à modifier cette salle"
            );
        }

        // Mettre à jour les champs
        salle.setNom(salleData.getNom());
        salle.setDescription(salleData.getDescription());
        salle.setVille(salleData.getVille());
        salle.setAdresse(salleData.getAdresse());
        salle.setPrixJour(salleData.getPrixJour());
        salle.setCapacite(salleData.getCapacite());
        salle.setReglementInterieur(salleData.getReglementInterieur());

        Salle updated = salleRepository.save(salle);
        return salleMapper.toResponse(updated);
    }

    @Override
    public void supprimerSalle(Long id, String emailProprio) {

        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));

        if (!salle.getProprietaire().getEmail().equals(emailProprio)) {
            throw new ConflictException(
                    "Vous n'êtes pas autorisé à supprimer cette salle"
            );
        }

        salleRepository.delete(salle);
    }

    @Override
    public SalleResponse getSalleById(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));
        return salleMapper.toResponse(salle);
    }

    @Override
    public List<SalleResponse> rechercherSalles(String ville,
                                                Integer capacite,
                                                String tri,
                                                String keyword) {
        List<Salle> salles;

        if (keyword != null && !keyword.isEmpty()) {
            salles = salleRepository.searchByKeyword(
                    keyword, StatutSalle.VALIDEE
            );
        } else if (tri != null && tri.equals("prix")) {
            salles = salleRepository
                    .findByVilleAndStatutOrderByPrixJourAsc(
                            ville, StatutSalle.VALIDEE
                    );
        } else if (tri != null && tri.equals("note")) {
            salles = salleRepository
                    .findByVilleAndStatutOrderByNoteDesc(
                            ville, StatutSalle.VALIDEE
                    );
        } else if (capacite != null) {
            salles = salleRepository
                    .findByVilleAndCapaciteGreaterThanEqualAndStatut(
                            ville, capacite, StatutSalle.VALIDEE
                    );
        } else {
            salles = salleRepository.findByVilleAndStatut(
                    ville, StatutSalle.VALIDEE
            );
        }

        return salles.stream()
                .map(salleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SalleResponse> getSallesByProprio(String emailProprio) {
        User proprio = userRepository.findByEmail(emailProprio)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Propriétaire non trouvé"
                ));

        return salleRepository.findByProprietaire(proprio)
                .stream()
                .map(salleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SalleResponse validerSalle(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));
        salle.setStatut(StatutSalle.VALIDEE);
        return salleMapper.toResponse(salleRepository.save(salle));
    }

    @Override
    public SalleResponse refuserSalle(Long id) {
        Salle salle = salleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle", id));
        salle.setStatut(StatutSalle.REFUSEE);
        return salleMapper.toResponse(salleRepository.save(salle));
    }
}