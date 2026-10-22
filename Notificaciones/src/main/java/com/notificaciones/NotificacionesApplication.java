package com.notificaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class NotificacionesApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificacionesApplication.class, args);
        System.out.println("MS Notificaciones La Pannacotta ACTIVO");
    }
}