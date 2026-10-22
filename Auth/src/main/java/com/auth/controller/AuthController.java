package com.auth.controller;

import com.auth.bean.dto.LoginRequest;
import com.auth.bean.dto.LoginResponse;
import com.auth.bean.dto.RegistroRequest;
import com.auth.bean.dto.UsuarioResponse;
import com.auth.bean.entity.Usuario;
import com.auth.model.AuthModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthModel authModel;

    @PostMapping("/login")
    public LoginResponse Login(@RequestBody LoginRequest request) {
        return authModel.Login(request);
    }

    @PostMapping("/registrar")
    public ResponseEntity<Object> Registrar(@RequestBody RegistroRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(authModel.Registrar(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "Auth";
    }
}