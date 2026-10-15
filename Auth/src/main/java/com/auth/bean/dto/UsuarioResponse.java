package com.auth.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String username;
    private String nombre;
    private String rol;
    private String estado;
}