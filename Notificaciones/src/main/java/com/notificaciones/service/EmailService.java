package com.notificaciones.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public void Enviar(String destinatario, String asunto, String cuerpo) {
        if (destinatario == null || destinatario.isBlank()) {
            System.out.println("[Email] Sin correo destino — se omite envío.");
            return;
        }
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom("edgaradrianmora@gmail.com");
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            System.out.println("[Email] ✅ Enviado a " + destinatario);
        } catch (Exception e) {
            System.out.println("[Email] ⚠ Error al enviar a "
                    + destinatario + ": " + e.getMessage());
        }
    }
}