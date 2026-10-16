package com.delivery.model;

import java.time.LocalDateTime;
import java.util.List;

import com.delivery.bean.entity.Delivery;
import com.delivery.repository.DeliveryRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DeliveryModel {

    private final DeliveryRepository deliveryRepository;

    public List<Delivery> Listar() {
        return deliveryRepository.findAll();
    }

    public Delivery BuscarPorId(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery no encontrado"));
    }
    
    public Delivery BuscarPorPedido(Long pedidoId) {
        return deliveryRepository.findByPedidoId(pedidoId).orElse(null);
    }

    public Delivery Registrar(Delivery delivery) {
        delivery.setEstado("PENDIENTE");
        delivery.setFechaAsignacion(LocalDateTime.now());
        return deliveryRepository.save(delivery);
    }

    public Delivery Actualizar(Long id, Delivery datos) {
        Delivery delivery = BuscarPorId(id);
        delivery.setRepartidor(datos.getRepartidor());
        delivery.setEstado(datos.getEstado());
        if ("ENTREGADO".equals(datos.getEstado())) {
            delivery.setFechaEntrega(LocalDateTime.now());
        }
        return deliveryRepository.save(delivery);
    }

    public void Eliminar(Long id) {
        deliveryRepository.deleteById(id);
    }
}