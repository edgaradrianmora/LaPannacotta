package com.notificaciones.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    @GetMapping("/aviso")
    public String Aviso() {
        return "MS Notificaciones La Pannacotta";
    }
}