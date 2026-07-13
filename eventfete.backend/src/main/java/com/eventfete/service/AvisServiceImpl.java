package com.eventfete.service;

import com.eventfete.dto.request.AvisReponseRequest;
import com.eventfete.dto.request.AvisRequest;
import com.eventfete.dto.response.AvisResponse;
import com.eventfete.entity.Avis;
import com.eventfete.entity.Reservation;
import com.eventfete.entity.Salle;
import com.eventfete.enums.StatutReservation;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.AvisMapper;
import com.eventfete.repository.AvisRepository;
import com.eventfete.repository.ReservationRepository;
import com.eventfete.repository.SalleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AvisServiceImpl implements AvisService {

    private final AvisRepository avisRepository;
    private final ReservationRepository reservationRepository;
    private final SalleRepository salleRepository;
    private final AvisMapper avisMapper;

    @Override
    @Transactional
    public AvisResponse creerAvis(AvisRequest request, String emailClient) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Réservation non trouvée"));

        // RG-07 : seul le client de la réservation peut laisser un avis
        if (!reservation.getClient().getEmail().equals(emailClient)) {
            throw new ConflictException(
                    "Vous n'êtes pas autorisé à laisser un avis pour cette réservation"
            );
        }

        // RG-07 : réservation CONFIRMEE uniquement
        if (reservation.getStatut() != StatutReservation.CONFIRMEE) {
            throw new ConflictException(
                    "Seule une réservation confirmée peut faire l'objet d'un avis"
            );
        }

        // On ne peut avis qu'une fois l'événement passé
        if (reservation.getDateFin().isAfter(LocalDateTime.now())) {
            throw new ConflictException(
                    "Vous pourrez laisser un avis une fois l'événement terminé"
            );
        }

        // RG-AVIS-02 : un seul avis par réservation
        if (avisRepository.existsByReservationId(reservation.getId())) {
            throw new ConflictException(
                    "Vous avez déjà laissé un avis pour cette réservation"
            );
        }

        Avis avis = Avis.builder()
                .reservation(reservation)
                .client(reservation.getClient())
                .salle(reservation.getSalle())
                .note(request.getNote())
                .commentaire(request.getCommentaire())
                .build();

        Avis saved = avisRepository.save(avis);

        recalculerNoteMoyenne(reservation.getSalle());

        return avisMapper.toResponse(saved);
    }

    @Override
    public List<AvisResponse> getAvisBySalle(Long salleId) {
        return avisRepository.findBySalleIdAndEnQuarantaineFalseOrderByCreatedAtDesc(salleId)
                .stream()
                .map(avisMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AvisResponse repondre(Long avisId, AvisReponseRequest request, String emailProprio) {
        Avis avis = avisRepository.findById(avisId)
                .orElseThrow(() -> new ResourceNotFoundException("Avis non trouvé"));

        if (!avis.getSalle().getProprietaire().getEmail().equals(emailProprio)) {
            throw new ConflictException(
                    "Vous n'êtes pas autorisé à répondre à cet avis"
            );
        }

        // RG-AVIS-03 : la réponse ne peut être modifiée qu'une seule fois après publication
        if (avis.getReponseProprio() != null) {
            throw new ConflictException(
                    "Une réponse a déjà été publiée pour cet avis"
            );
        }

        avis.setReponseProprio(request.getReponse());
        return avisMapper.toResponse(avisRepository.save(avis));
    }

    private void recalculerNoteMoyenne(Salle salle) {
        List<Avis> tousLesAvis = avisRepository
                .findBySalleIdAndEnQuarantaineFalseOrderByCreatedAtDesc(salle.getId());

        double moyenne = tousLesAvis.stream()
                .mapToInt(Avis::getNote)
                .average()
                .orElse(0.0);

        salle.setNote(moyenne);
        salle.setNbAvis(tousLesAvis.size());
        salleRepository.save(salle);
    }
}