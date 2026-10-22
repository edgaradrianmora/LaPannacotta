package com.auth.model;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.auth.bean.dto.LoginRequest;
import com.auth.bean.dto.LoginResponse;
import com.auth.bean.dto.RegistroRequest;
import com.auth.bean.dto.UsuarioResponse;
import com.auth.bean.entity.Usuario;
import com.auth.exception.ApiException;
import com.auth.repository.UsuarioRepository;
import com.auth.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class AuthModel {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public LoginResponse Login(LoginRequest request) {

        if (request == null || request.getUsername() == null || request.getUsername().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El usuario es obligatorio");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La contraseña es obligatoria");
        }

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos");
        }

        if (!"ACTIVO".equals(usuario.getEstado())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "El usuario se encuentra inactivo");
        }

        String token = jwtUtil.GenerarToken(usuario.getUsername(), usuario.getRol());

        return new LoginResponse(token, usuario.getUsername(), usuario.getRol());
    }

    public UsuarioResponse Registrar(RegistroRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank())
            throw new ApiException(HttpStatus.BAD_REQUEST, "El usuario es obligatorio.");
        String username = request.getUsername().trim();
        if (username.length() < 4 || username.length() > 50)
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "El usuario debe tener entre 4 y 50 caracteres.");
        if (request.getPassword() == null || request.getPassword().length() < 6)
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "La contraseña debe tener al menos 6 caracteres.");
        if (request.getNombre() == null || request.getNombre().isBlank())
            throw new ApiException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio.");
        if (usuarioRepository.findByUsername(username).isPresent())
            throw new ApiException(HttpStatus.CONFLICT,
                "Ya existe un usuario con ese nombre de usuario.");

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setNombre(request.getNombre());
        usuario.setCorreo(request.getCorreo());
        usuario.setRol("CLIENTE");
        usuario.setEstado("ACTIVO");

        Usuario guardado = usuarioRepository.save(usuario);
        return new UsuarioResponse(guardado.getId(), guardado.getUsername(),
                guardado.getNombre(), guardado.getRol(), guardado.getEstado());
    }
}