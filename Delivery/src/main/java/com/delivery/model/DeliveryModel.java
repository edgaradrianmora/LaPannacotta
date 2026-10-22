package com.delivery.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.delivery.bean.dto.*;
import com.delivery.bean.entity.Delivery;
import com.delivery.configuration.RabbitMQConfiguration;
import com.delivery.repository.DeliveryRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DeliveryModel {

    private final DeliveryRepository deliveryRepository;
    private final RabbitTemplate rabbitTemplate;

    private static final Map<String, String> SIGUIENTE_ESTADO = Map.of(
            "PENDIENTE", "ASIGNADO",
            "ASIGNADO",  "EN_CAMINO",
            "EN_CAMINO", "ENTREGADO"
    );

    private static final Map<String, String> ROUTING_KEY_POR_ESTADO = Map.of(
            "ASIGNADO",  RabbitMQConfiguration.RK_DELIVERY_ASIGNADO,
            "EN_CAMINO", RabbitMQConfiguration.RK_DELIVERY_EN_CAMINO,
            "ENTREGADO", RabbitMQConfiguration.RK_DELIVERY_ENTREGADO
    );

    private static final Map<String, String> TIPO_EVENTO_POR_ESTADO = Map.of(
            "ASIGNADO",  "DELIVERY_ASIGNADO",
            "EN_CAMINO", "DELIVERY_EN_CAMINO",
            "ENTREGADO", "DELIVERY_ENTREGADO"
    );

    public List<DeliveryResponseDto> Listar() {
        return deliveryRepository.findAll()
                .stream()
                .map(this::ToResponseDto)
                .collect(Collectors.toList());
    }

    public DeliveryResponseDto BuscarPorId(Long id) {
        return ToResponseDto(ObtenerEntidad(id));
    }

    public DeliveryResponseDto BuscarPorPedido(Long pedidoId) {
        return deliveryRepository.findByPedidoId(pedidoId)
                .map(this::ToResponseDto)
                .orElse(null);
    }

    public DeliveryResponseDto Registrar(DeliveryRegistrarRequest request) {
        Delivery delivery = new Delivery();
        delivery.setPedidoId(request.getPedidoId());
        delivery.setClienteNombre(request.getClienteNombre());
        delivery.setClienteUsername(request.getClienteUsername());
        delivery.setClienteTelefono(request.getClienteTelefono());
        delivery.setDireccion(request.getDireccion());
        delivery.setEstado("PENDIENTE");
        delivery.setFechaAsignacion(LocalDateTime.now());
        return ToResponseDto(deliveryRepository.save(delivery));
    }

    public DeliveryResponseDto Actualizar(Long id, DeliveryActualizarRequest request) {
        Delivery delivery = ObtenerEntidad(id);

        String estadoActual = delivery.getEstado();
        String nuevoEstado  = request.getEstado();

        if (nuevoEstado != null && !nuevoEstado.equals(estadoActual)) {
            String estadoPermitido = SIGUIENTE_ESTADO.get(estadoActual);

            if (estadoPermitido == null) {
                throw new RuntimeException(
                    "El delivery ya está en estado final: " + estadoActual);
            }
            if (!nuevoEstado.equals(estadoPermitido)) {
                throw new RuntimeException(
                    "Transición no permitida: " + estadoActual + " → " + nuevoEstado
                    + ". El siguiente estado permitido es: " + estadoPermitido);
            }

            if ("ASIGNADO".equals(nuevoEstado)
                    && (request.getRepartidor() == null
                        || request.getRepartidor().isBlank())) {
                throw new RuntimeException(
                    "Para asignar un delivery debes indicar el nombre del repartidor.");
            }
        }

        if (request.getRepartidor() != null && !request.getRepartidor().isBlank()) {
            delivery.setRepartidor(request.getRepartidor());
        }
        if (nuevoEstado != null) {
            delivery.setEstado(nuevoEstado);
        }
        if ("ENTREGADO".equals(nuevoEstado)) {
            delivery.setFechaEntrega(LocalDateTime.now());
        }

        Delivery actualizado = deliveryRepository.save(delivery);

        if (nuevoEstado != null && !nuevoEstado.equals(estadoActual)) {
            PublicarEvento(actualizado);
        }

        return ToResponseDto(actualizado);
    }

    public void Eliminar(Long id) {
        Delivery delivery = ObtenerEntidad(id);

        if ("ENTREGADO".equals(delivery.getEstado())) {
            throw new RuntimeException(
                "No se puede eliminar un delivery que ya fue entregado.");
        }

        deliveryRepository.deleteById(id);
    }

    private Delivery ObtenerEntidad(Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Delivery no encontrado con id: " + id));
    }

    private void PublicarEvento(Delivery delivery) {
        String routingKey = ROUTING_KEY_POR_ESTADO.get(delivery.getEstado());
        String tipoEvento = TIPO_EVENTO_POR_ESTADO.get(delivery.getEstado());

        if (routingKey == null) return;

        DeliveryEventoDto evento = new DeliveryEventoDto(
                delivery.getId(),
                delivery.getPedidoId(),
                delivery.getClienteNombre(),
                delivery.getClienteUsername(),
                delivery.getClienteTelefono(),
                delivery.getDireccion(),
                delivery.getRepartidor(),
                delivery.getCorreoCliente(),
                delivery.getEstado(),
                tipoEvento
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfiguration.EXCHANGE,
                routingKey,
                evento
        );

        System.out.println("[RabbitMQ] Publicado '" + routingKey
                + "' - " + tipoEvento
                + " - Pedido #" + delivery.getPedidoId()
                + " - Correo: " + delivery.getCorreoCliente());
    }

    private DeliveryResponseDto ToResponseDto(Delivery d) {
        return new DeliveryResponseDto(
                d.getId(),
                d.getPedidoId(),
                d.getClienteNombre(),
                d.getClienteUsername(),
                d.getClienteTelefono(),
                d.getDireccion(),
                d.getRepartidor(),
                d.getCorreoCliente(),
                d.getFechaAsignacion(),
                d.getFechaEntrega(),
                d.getEstado()
        );
    }
}