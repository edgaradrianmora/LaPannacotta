package com.auth.bean.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {
    private String username;
    private String password;
    private String nombre;
    private String correo;
}