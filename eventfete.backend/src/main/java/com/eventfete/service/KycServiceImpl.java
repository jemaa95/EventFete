package com.eventfete.service;

import com.eventfete.dto.request.KycRejectRequest;
import com.eventfete.dto.request.KycSubmissionRequest;
import com.eventfete.dto.response.UserAdminResponse;
import com.eventfete.entity.User;
import com.eventfete.enums.KycStatut;
import com.eventfete.enums.Role;
import com.eventfete.exception.ConflictException;
import com.eventfete.exception.ResourceNotFoundException;
import com.eventfete.mapper.UserMapper;
import com.eventfete.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KycServiceImpl implements KycService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserAdminResponse soumettreKyc(String email, KycSubmissionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (user.getRole() != Role.ROLE_PROPRIO) {
            throw new ConflictException(
                    "Seuls les comptes propriétaires peuvent soumettre un dossier KYC"
            );
        }

        if (user.getKycStatut() == KycStatut.APPROUVEE) {
            throw new ConflictException("Votre dossier KYC est déjà approuvé");
        }

        user.setEntreprise(request.getEntreprise());
        user.setDocumentsKyc(request.getDocuments());
        user.setKycStatut(KycStatut.EN_ATTENTE);
        user.setMotifRejetKyc(null);
        user.setDateSoumissionKyc(LocalDateTime.now());

        return userMapper.toAdminResponse(userRepository.save(user));
    }

    @Override
    public List<UserAdminResponse> listerToutesLesDemandes() {
        return userRepository.findByRole(Role.ROLE_PROPRIO).stream()
                .filter(u -> u.getKycStatut() != null && u.getKycStatut() != KycStatut.NON_SOUMIS)
                .map(userMapper::toAdminResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserAdminResponse approuver(Long userId) {
        User user = findProprio(userId);
        user.setKycStatut(KycStatut.APPROUVEE);
        user.setMotifRejetKyc(null);
        return userMapper.toAdminResponse(userRepository.save(user));
    }

    @Override
    public UserAdminResponse rejeter(Long userId, KycRejectRequest request) {
        User user = findProprio(userId);
        user.setKycStatut(KycStatut.REJETEE);
        user.setMotifRejetKyc(request.getMotif());
        return userMapper.toAdminResponse(userRepository.save(user));
    }

    private User findProprio(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (user.getRole() != Role.ROLE_PROPRIO) {
            throw new ConflictException("Cet utilisateur n'est pas un propriétaire");
        }
        return user;
    }
}