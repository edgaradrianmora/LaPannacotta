package com.delivery.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.delivery.bean.entity.Delivery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class DeliveryRepositoryTest {

    @Autowired
    private DeliveryRepository deliveryRepository;

    private Delivery delivery;

    @BeforeEach
    void setUp() {
        delivery = new Delivery();
        delivery.setPedidoId(1L);
        delivery.setClienteNombre("Maria Lopez");
        delivery.setDireccion("Av. Micaela Bastidas 900");
        delivery.setEstado("PENDIENTE");
        delivery.setFechaAsignacion(LocalDateTime.now());
    }

    @Test
    void DebeInsertarDelivery() {
        Delivery guardado = deliveryRepository.save(delivery);
        assertThat(guardado.getId()).isNotNull();
    }

    @Test
    void DebeListarDeliveries() {
        deliveryRepository.save(delivery);
        List<Delivery> deliveries = deliveryRepository.findAll();
        assertThat(deliveries).isNotEmpty();
    }

    @Test
    void DebeActualizarDelivery() {
        Delivery guardado = deliveryRepository.save(delivery);
        guardado.setEstado("EN_CAMINO");
        guardado.setRepartidor("Carlos Quispe");
        Delivery actualizado = deliveryRepository.save(guardado);
        assertThat(actualizado.getEstado()).isEqualTo("EN_CAMINO");
    }

    @Test
    void DebeEliminarDelivery() {
        Delivery guardado = deliveryRepository.save(delivery);
        Long id = guardado.getId();
        deliveryRepository.deleteById(id);
        Optional<Delivery> resultado = deliveryRepository.findById(id);
        assertThat(resultado).isEmpty();
    }
}