package com.eventfete.service;

import com.eventfete.dto.response.SalleResponse;
import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutSalle;
import com.eventfete.enums.KycStatut;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.SalleMapper;
import com.eventfete.repository.SalleRepository;
import com.eventfete.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
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

        // RG-KYC : publication impossible si le KYC du propriétaire n'est pas approuvé
        if (proprio.getKycStatut() != KycStatut.APPROUVEE) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Votre dossier KYC doit être approuvé par un administrateur avant de pouvoir publier une salle"
            );
        }

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
        } else {
            Sort sort = "prix".equals(tri)
                    ? Sort.by(Sort.Direction.ASC, "prixJour")
                    : "note".equals(tri)
                    ? Sort.by(Sort.Direction.DESC, "note")
                    : Sort.unsorted();

            boolean hasVille = ville != null && !ville.isBlank();
            boolean hasCapacite = capacite != null;

            if (hasVille && hasCapacite) {
                salles = salleRepository.findByStatutAndVilleContainingIgnoreCaseAndCapaciteGreaterThanEqual(
                        StatutSalle.VALIDEE, ville, capacite, sort
                );
            } else if (hasVille) {
                salles = salleRepository.findByStatutAndVilleContainingIgnoreCase(
                        StatutSalle.VALIDEE, ville, sort
                );
            } else if (hasCapacite) {
                salles = salleRepository.findByStatutAndCapaciteGreaterThanEqual(
                        StatutSalle.VALIDEE, capacite, sort
                );
            } else {
                salles = salleRepository.findByStatut(StatutSalle.VALIDEE, sort);
            }
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

    @Override
    public List<SalleResponse> getSallesEnAttente() {
        // ⚠️ Ne PAS utiliser rechercherSalles(null,null,null,null) ici : cette
        // méthode filtre toujours sur StatutSalle.VALIDEE en interne, donc elle
        // ne renverrait jamais les salles réellement en attente de validation.
        return salleRepository.findByStatut(StatutSalle.EN_ATTENTE).stream()
                .map(salleMapper::toResponse)
                .collect(Collectors.toList());
    }
}