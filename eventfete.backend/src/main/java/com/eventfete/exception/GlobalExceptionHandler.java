package com.eventfete.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Erreurs de validation (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        });

        return ResponseEntity.badRequest().body(
                buildResponse(HttpStatus.BAD_REQUEST, "Erreurs de validation", errors)
        );
    }

    // Ressource introuvable
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null)
        );
    }

    // Conflit (double réservation)
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(
            ConflictException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                buildResponse(HttpStatus.CONFLICT, ex.getMessage(), null)
        );
    }

    // Mauvais identifiants
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(
            BadCredentialsException ex) {

        // Spring Security lève "Bad credentials" par défaut lors de l'authentification ;
        // dans ce cas précis on garde un message générique en français plutôt que
        // d'exposer le texte brut. Les messages personnalisés levés ailleurs dans le
        // code (compte désactivé, mot de passe actuel incorrect, etc.) sont conservés tels quels.
        String message = (ex.getMessage() == null || "Bad credentials".equals(ex.getMessage()))
                ? "Email ou mot de passe incorrect"
                : ex.getMessage();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                buildResponse(HttpStatus.UNAUTHORIZED, message, null)
        );
    }

    // Accès refusé
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException ex) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                buildResponse(HttpStatus.FORBIDDEN, "Accès refusé", null)
        );
    }

    // Erreur générale
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Erreur interne du serveur", null)
        );
    }

    // Méthode utilitaire
    private Map<String, Object> buildResponse(HttpStatus status,
                                              String message,
                                              Object details) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        if (details != null) {
            response.put("details", details);
        }
        return response;
    }
}