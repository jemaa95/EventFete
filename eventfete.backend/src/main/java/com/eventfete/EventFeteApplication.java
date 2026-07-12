package com.eventfete;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EventFeteApplication {
    public static void main(String[] args) {
        SpringApplication.run(EventFeteApplication.class, args);
    }
}