package com.eventfete.repository;

import com.eventfete.entity.User;
import com.eventfete.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Trouver par email (pour login)
    Optional<User> findByEmail(String email);

    // Vérifier si email existe déjà (pour register)
    boolean existsByEmail(String email);

    // Trouver tous les utilisateurs par rôle
    List<User> findByRole(Role role);

    // Trouver les utilisateurs actifs
    List<User> findByActifTrue();
}