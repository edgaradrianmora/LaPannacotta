package com.auth.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;


import com.auth.bean.entity.Usuario;

@DataJpaTest
public class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = new Usuario();
        usuario.setUsername("test_user");
        usuario.setPassword("$2a$10$hashfalsoparapruebas");
        usuario.setNombre("Usuario de Prueba");
        usuario.setRol("ADMIN");
        usuario.setEstado("ACTIVO");
    }

    @Test
    void DebeInsertarUsuario() {
        Usuario guardado = usuarioRepository.save(usuario);
        assertThat(guardado.getId()).isNotNull();
    }

    @Test
    void DebeListarUsuarios() {
        usuarioRepository.save(usuario); 
        List<Usuario> usuarios = usuarioRepository.findAll();
        assertThat(usuarios).isNotEmpty();
    }

    @Test
    void DebeActualizarUsuario() {
        Usuario guardado = usuarioRepository.save(usuario);
        guardado.setNombre("Usuario Actualizado");
        Usuario actualizado = usuarioRepository.save(guardado);
        assertThat(actualizado.getNombre()).isEqualTo("Usuario Actualizado");
    }

    @Test
    void DebeEliminarUsuario() {
        Usuario guardado = usuarioRepository.save(usuario);
        Long id = guardado.getId();
        usuarioRepository.deleteById(id);
        Optional<Usuario> resultado = usuarioRepository.findById(id);
        assertThat(resultado).isEmpty();
    }

    @Test
    void DebeEncontrarPorUsername() {
        usuarioRepository.save(usuario);
        Optional<Usuario> resultado = usuarioRepository.findByUsername("test_user");
        assertThat(resultado).isPresent();
    }
}