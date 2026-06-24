package com.eventfete.service;

import com.eventfete.dto.request.ReservationRequest;
import com.eventfete.entity.Reservation;
import com.eventfete.entity.Salle;
import com.eventfete.entity.User;
import com.eventfete.enums.StatutReservation;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.ReservationMapper;
import com.eventfete.repository.ReservationRepository;
import com.eventfete.repository.SalleRepository;
import com.eventfete.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final SalleRepository salleRepository;
    private final UserRepository userRepository;
    private final ReservationMapper reservationMapper;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_KEY_PREFIX = "lock:salle:";
    private static final long LOCK_DURATION_MINUTES = 15;

    @Override
    @Transactional
    public Map<String, Object> creerReservation(ReservationRequest request,
                                                String emailClient) {
        // Vérifier date future (RG-03)
        if (request.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ConflictException(
                    "La date de réservation doit être dans le futur"
            );
        }

        // Récupérer client et salle
        User client = userRepository.findByEmail(emailClient)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Client non trouvé"
                ));

        Salle salle = salleRepository.findById(request.getSalleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Salle", request.getSalleId()
                ));

        // Clé Redis pour verrouillage (RG-02)
        String redisKey = REDIS_KEY_PREFIX + salle.getId() + ":" +
                request.getDateDebut() + ":" +
                request.getDateFin();

        // Vérifier si créneau déjà verrouillé dans Redis
        Boolean lockAcquired = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, emailClient,
                        Duration.ofMinutes(LOCK_DURATION_MINUTES));

        if (Boolean.FALSE.equals(lockAcquired)) {
            throw new ConflictException(
                    "Ce créneau est temporairement réservé par un autre client. " +
                            "Veuillez réessayer dans quelques minutes."
            );
        }

        // Vérifier conflit en base (RG-01)
        boolean conflict = reservationRepository.existsConflict(
                salle.getId(),
                request.getDateDebut(),
                request.getDateFin()
        );

        if (conflict) {
            // Libérer le verrou Redis
            redisTemplate.delete(redisKey);
            throw new ConflictException(
                    "Ce créneau est déjà réservé. Veuillez choisir une autre date."
            );
        }

        // Calculer le montant total
        long nbJours = ChronoUnit.DAYS.between(
                request.getDateDebut(), request.getDateFin()
        );
        BigDecimal montantTotal = salle.getPrixJour()
                .multiply(BigDecimal.valueOf(nbJours));

        // Créer la réservation
        Reservation reservation = Reservation.builder()
                .salle(salle)
                .client(client)
                .dateDebut(request.getDateDebut())
                .dateFin(request.getDateFin())
                .statut(StatutReservation.CONFIRMEE)
                .montantTotal(montantTotal)
                .build();

        Reservation saved = reservationRepository.save(reservation);

        // Libérer le verrou Redis après confirmation (RG-04)
        redisTemplate.delete(redisKey);

        return reservationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public Map<String, Object> annulerReservation(Long id,
                                                  String emailClient) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Réservation", id
                ));

        // Vérifier que c'est bien le client
        if (!reservation.getClient().getEmail().equals(emailClient)) {
            throw new ConflictException(
                    "Vous n'êtes pas autorisé à annuler cette réservation"
            );
        }

        // Vérifier que la date est future
        if (reservation.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ConflictException(
                    "Impossible d'annuler une réservation passée"
            );
        }

        // Calculer les frais selon la politique (RG-05, RG-06)
        long joursAvant = ChronoUnit.DAYS.between(
                LocalDateTime.now(), reservation.getDateDebut()
        );

        String messageRemboursement;
        if (joursAvant > 7) {
            // Remboursement 100%
            messageRemboursement = "Remboursement intégral (100%)";
        } else if (joursAvant >= 2) {
            // Frais 30%
            messageRemboursement = "Frais de 30% retenus sur l'acompte";
        } else {
            // Aucun remboursement
            messageRemboursement = "Aucun remboursement (moins de 48h)";
        }

        reservation.setStatut(StatutReservation.ANNULEE);
        reservation.setMotifAnnulation(messageRemboursement);

        Reservation updated = reservationRepository.save(reservation);
        return reservationMapper.toResponse(updated);
    }

    @Override
    public List<Map<String, Object>> getMesReservations(String emailClient) {
        User client = userRepository.findByEmail(emailClient)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Client non trouvé"
                ));

        return reservationRepository.findByClient(client)
                .stream()
                .map(reservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getReservationsProprio(
            String emailProprio) {

        User proprio = userRepository.findByEmail(emailProprio)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Propriétaire non trouvé"
                ));

        return reservationRepository
                .findByProprioAndStatut(
                        proprio.getId(), StatutReservation.CONFIRMEE
                )
                .stream()
                .map(reservationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Réservation", id
                ));
        return reservationMapper.toResponse(reservation);
    }
}