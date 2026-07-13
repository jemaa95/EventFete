package com.eventfete.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // Email de confirmation de réservation au client
    @Async
    public void envoyerConfirmationReservation(String emailClient,
                                               String nomClient,
                                               String nomSalle,
                                               String dateDebut,
                                               String dateFin,
                                               String montant) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailClient);
        message.setSubject("✅ Confirmation de votre réservation - EventFete");
        message.setText(
                "Bonjour " + nomClient + ",\n\n" +
                        "Votre réservation a été confirmée avec succès !\n\n" +
                        "📍 Salle : " + nomSalle + "\n" +
                        "📅 Du : " + dateDebut + "\n" +
                        "📅 Au : " + dateFin + "\n" +
                        "💰 Montant total : " + montant + " MAD\n\n" +
                        "Merci de votre confiance.\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }

    // Email de notification au propriétaire
    @Async
    public void envoyerNotificationProprio(String emailProprio,
                                           String nomProprio,
                                           String nomClient,
                                           String nomSalle,
                                           String dateDebut,
                                           String dateFin) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailProprio);
        message.setSubject("🔔 Nouvelle réservation - EventFete");
        message.setText(
                "Bonjour " + nomProprio + ",\n\n" +
                        "Vous avez reçu une nouvelle réservation !\n\n" +
                        "👤 Client : " + nomClient + "\n" +
                        "📍 Salle : " + nomSalle + "\n" +
                        "📅 Du : " + dateDebut + "\n" +
                        "📅 Au : " + dateFin + "\n\n" +
                        "Connectez-vous sur EventFete pour gérer cette réservation.\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }

    // Email au client : demande envoyée, en attente d'acceptation par le propriétaire
    @Async
    public void envoyerDemandeEnAttente(String emailClient,
                                        String nomClient,
                                        String nomSalle,
                                        String dateDebut,
                                        String dateFin) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailClient);
        message.setSubject("⏳ Demande de réservation envoyée - EventFete");
        message.setText(
                "Bonjour " + nomClient + ",\n\n" +
                        "Votre demande de réservation a bien été envoyée au propriétaire.\n\n" +
                        "📍 Salle : " + nomSalle + "\n" +
                        "📅 Du : " + dateDebut + "\n" +
                        "📅 Au : " + dateFin + "\n\n" +
                        "Vous recevrez un email dès que le propriétaire aura accepté ou refusé votre demande.\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }

    // Email d'annulation
    @Async
    public void envoyerConfirmationAnnulation(String emailClient,
                                              String nomClient,
                                              String nomSalle,
                                              String messageRemboursement) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailClient);
        message.setSubject("❌ Annulation de réservation - EventFete");
        message.setText(
                "Bonjour " + nomClient + ",\n\n" +
                        "Votre réservation pour la salle \"" + nomSalle +
                        "\" a été annulée.\n\n" +
                        "💰 Remboursement : " + messageRemboursement + "\n\n" +
                        "Pour toute question, contactez notre support.\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }

    // Email de bienvenue après inscription
    @Async
    public void envoyerEmailBienvenue(String emailClient,
                                      String nomClient) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailClient);
        message.setSubject("🎉 Bienvenue sur EventFete !");
        message.setText(
                "Bonjour " + nomClient + ",\n\n" +
                        "Bienvenue sur EventFete, la plateforme de réservation " +
                        "de salles de fête au Maroc !\n\n" +
                        "Vous pouvez dès maintenant rechercher et réserver " +
                        "la salle de vos rêves.\n\n" +
                        "Bonne recherche !\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }

    // Email de réinitialisation mot de passe
    @Async
    public void envoyerReinitialisationMotDePasse(String emailClient,
                                                  String nomClient,
                                                  String lienReset) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(emailClient);
        message.setSubject("🔑 Réinitialisation de votre mot de passe - EventFete");
        message.setText(
                "Bonjour " + nomClient + ",\n\n" +
                        "Vous avez demandé la réinitialisation de votre mot de passe.\n\n" +
                        "Cliquez sur le lien suivant pour le réinitialiser :\n" +
                        lienReset + "\n\n" +
                        "Ce lien expire dans 30 minutes.\n\n" +
                        "Si vous n'avez pas fait cette demande, ignorez cet email.\n\n" +
                        "L'équipe EventFete 🎉"
        );
        mailSender.send(message);
    }
}