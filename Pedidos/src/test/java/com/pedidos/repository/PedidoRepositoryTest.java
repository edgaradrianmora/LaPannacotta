package com.pedidos.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.pedidos.bean.entity.Pedido;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class PedidoRepositoryTest {

    @Autowired
    private PedidoRepository pedidoRepository;

    private Pedido pedido;

    @BeforeEach
    void setUp() {
        pedido = new Pedido();
        pedido.setClienteNombre("Juan Perez");
        pedido.setClienteTelefono("999111222");
        pedido.setDireccionEntrega("Av. Siempre Viva 123");
        pedido.setFecha(LocalDateTime.now());
        pedido.setTotal(100.0);
        pedido.setEstado("PENDIENTE");
    }

    @Test
    void DebeInsertarPedido() {
        Pedido guardado = pedidoRepository.save(pedido);
        assertThat(guardado.getId()).isNotNull();
    }

    @Test
    void DebeListarPedidos() {
        pedidoRepository.save(pedido);
        List<Pedido> pedidos = pedidoRepository.findAll();
        assertThat(pedidos).isNotEmpty();
    }

    @Test
    void DebeActualizarPedido() {
        Pedido guardado = pedidoRepository.save(pedido);
        guardado.setEstado("CONFIRMADO");
        Pedido actualizado = pedidoRepository.save(guardado);
        assertThat(actualizado.getEstado()).isEqualTo("CONFIRMADO");
    }

    @Test
    void DebeEliminarPedido() {
        Pedido guardado = pedidoRepository.save(pedido);
        Long id = guardado.getId();
        pedidoRepository.deleteById(id);
        Optional<Pedido> resultado = pedidoRepository.findById(id);
        assertThat(resultado).isEmpty();
    }
}