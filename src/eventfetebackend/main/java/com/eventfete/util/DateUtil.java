package com.eventfete.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtil {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public static String format(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(FORMATTER) : "";
    }

    public static long joursEntre(LocalDateTime debut, LocalDateTime fin) {
        return ChronoUnit.DAYS.between(debut, fin);
    }

    public static boolean estDansFutur(LocalDateTime date) {
        return date.isAfter(LocalDateTime.now());
    }

    public static boolean estAvant48h(LocalDateTime date) {
        return ChronoUnit.HOURS.between(LocalDateTime.now(), date) < 48;
    }

    public static boolean estAvant7Jours(LocalDateTime date) {
        return ChronoUnit.DAYS.between(LocalDateTime.now(), date) < 7;
    }
}