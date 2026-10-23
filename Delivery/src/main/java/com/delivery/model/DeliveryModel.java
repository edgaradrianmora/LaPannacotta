package com.delivery.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.delivery.bean.dto.DeliveryActualizarRequest;
import com.delivery.bean.dto.DeliveryEventoDto;
import com.delivery.bean.dto.DeliveryRegistrarRequest;
import com.delivery.bean.dto.DeliveryResponseDto;
import com.delivery.bean.entity.Delivery;
import com.delivery.bean.entity.Repartidor;
import com.delivery.configuration.RabbitMQConfiguration;
import com.delivery.repository.DeliveryRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class DeliveryModel {

    private final DeliveryRepository deliveryRepository;
    private final RepartidorModel repartidorModel;
    private final RabbitTemplate rabbitTemplate;

    private static final Map<String, String> SIGUIENTE_ESTADO = Map.of(
            "PENDIENTE", "ASIGNADO",
            "ASIGNADO", "EN_CAMINO",
            "EN_CAMINO", "ENTREGADO"
    );

    private static final Map<String, String> ROUTING_KEY_POR_ESTADO = Map.of(
            "ASIGNADO", RabbitMQConfiguration.RK_DELIVERY_ASIGNADO,
            "EN_CAMINO", RabbitMQConfiguration.RK_DELIVERY_EN_CAMINO,
            "ENTREGADO", RabbitMQConfiguration.RK_DELIVERY_ENTREGADO
    );

    private static final Map<String, String> TIPO_EVENTO_POR_ESTADO = Map.of(
            "ASIGNADO", "DELIVERY_ASIGNADO",
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

        return ToResponseDto(
                ObtenerEntidad(id)
        );
    }

    public DeliveryResponseDto BuscarPorPedido(Long pedidoId) {

        if (pedidoId == null) {
            return null;
        }

        return deliveryRepository.findByPedidoId(pedidoId)
                .map(this::ToResponseDto)
                .orElse(null);
    }

    public DeliveryResponseDto Registrar(
            DeliveryRegistrarRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Los datos de la entrega son obligatorios."
            );
        }

        if (request.getPedidoId() == null
                || request.getPedidoId() <= 0) {

            throw new RuntimeException(
                    "Debe indicar un número de pedido válido."
            );
        }

        if (deliveryRepository
                .existsByPedidoId(request.getPedidoId())) {

            throw new RuntimeException(
                    "El pedido #"
                            + request.getPedidoId()
                            + " ya tiene una entrega registrada."
            );
        }

        if (request.getClienteNombre() == null
                || request.getClienteNombre().isBlank()) {

            throw new RuntimeException(
                    "Debe indicar el nombre del cliente."
            );
        }

        if (request.getDireccion() == null
                || request.getDireccion().isBlank()) {

            throw new RuntimeException(
                    "Debe indicar la dirección de entrega."
            );
        }

        Delivery delivery = new Delivery();

        delivery.setPedidoId(
                request.getPedidoId()
        );

        delivery.setClienteNombre(
                request.getClienteNombre().trim()
        );

        if (request.getClienteUsername() != null
                && !request.getClienteUsername().isBlank()) {

            delivery.setClienteUsername(
                    request.getClienteUsername().trim()
            );
        }

        if (request.getClienteTelefono() != null
                && !request.getClienteTelefono().isBlank()) {

            delivery.setClienteTelefono(
                    request.getClienteTelefono().trim()
            );
        }

        delivery.setDireccion(
                request.getDireccion().trim()
        );

        delivery.setRepartidorId(null);
        delivery.setRepartidor(null);

        delivery.setEstado("PENDIENTE");

        delivery.setFechaAsignacion(
                LocalDateTime.now()
        );

        delivery.setFechaEntrega(null);

        Delivery guardado =
                deliveryRepository.save(delivery);

        return ToResponseDto(guardado);
    }

    public DeliveryResponseDto Actualizar(
            Long id,
            DeliveryActualizarRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Los datos de actualización son obligatorios."
            );
        }

        Delivery delivery =
                ObtenerEntidad(id);

        String estadoActual =
                delivery.getEstado();

        String nuevoEstado =
                request.getEstado();

        if (nuevoEstado != null) {
            nuevoEstado =
                    nuevoEstado.trim().toUpperCase();
        }

        if (request.getRepartidorId() != null) {

            Repartidor repartidor =
                    repartidorModel.BuscarPorId(
                            request.getRepartidorId()
                    );

            if (!"ACTIVO".equalsIgnoreCase(
                    repartidor.getEstado())) {

                throw new RuntimeException(
                        "El repartidor seleccionado no está activo."
                );
            }

            delivery.setRepartidorId(
                    repartidor.getId()
            );

            delivery.setRepartidor(
                    repartidor.getNombre()
            );
        }

        else if (request.getRepartidor() != null
                && !request.getRepartidor().isBlank()) {

            delivery.setRepartidor(
                    request.getRepartidor().trim()
            );
        }

        if (nuevoEstado != null
                && !nuevoEstado.equals(estadoActual)) {

            String estadoPermitido =
                    SIGUIENTE_ESTADO.get(
                            estadoActual
                    );

            if (estadoPermitido == null) {

                throw new RuntimeException(
                        "El delivery ya está en estado final: "
                                + estadoActual
                );
            }

            if (!nuevoEstado.equals(
                    estadoPermitido)) {

                throw new RuntimeException(
                        "Transición no permitida: "
                                + estadoActual
                                + " → "
                                + nuevoEstado
                                + ". El siguiente estado permitido es: "
                                + estadoPermitido
                );
            }

            if ("ASIGNADO".equals(nuevoEstado)
                    && (delivery.getRepartidor() == null
                    || delivery.getRepartidor().isBlank())) {

                throw new RuntimeException(
                        "Para asignar un delivery debes seleccionar un repartidor."
                );
            }
        }

        if (nuevoEstado != null) {

            delivery.setEstado(
                    nuevoEstado
            );
        }

        if ("ENTREGADO".equals(nuevoEstado)) {

            delivery.setFechaEntrega(
                    LocalDateTime.now()
            );
        }

        Delivery actualizado =
                deliveryRepository.save(delivery);

        if (nuevoEstado != null
                && !nuevoEstado.equals(estadoActual)) {

            PublicarEvento(
                    actualizado
            );
        }

        return ToResponseDto(
                actualizado
        );
    }

    public void Eliminar(Long id) {

        Delivery delivery =
                ObtenerEntidad(id);

        if ("ENTREGADO".equals(
                delivery.getEstado())) {

            throw new RuntimeException(
                    "No se puede eliminar un delivery que ya fue entregado."
            );
        }

        deliveryRepository.deleteById(id);
    }

    private Delivery ObtenerEntidad(Long id) {

        if (id == null) {
            throw new RuntimeException(
                    "El id del delivery es obligatorio."
            );
        }

        return deliveryRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Delivery no encontrado con id: "
                                        + id
                        )
                );
    }

    private void PublicarEvento(
            Delivery delivery) {

        String routingKey =
                ROUTING_KEY_POR_ESTADO.get(
                        delivery.getEstado()
                );

        String tipoEvento =
                TIPO_EVENTO_POR_ESTADO.get(
                        delivery.getEstado()
                );

        if (routingKey == null) {
            return;
        }

        DeliveryEventoDto evento =
                new DeliveryEventoDto(
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

        System.out.println(
                "[RabbitMQ] Publicado '"
                        + routingKey
                        + "' - "
                        + tipoEvento
                        + " - Pedido #"
                        + delivery.getPedidoId()
                        + " - Correo: "
                        + delivery.getCorreoCliente()
        );
    }

    private DeliveryResponseDto ToResponseDto(
            Delivery delivery) {

        return new DeliveryResponseDto(
                delivery.getId(),
                delivery.getPedidoId(),
                delivery.getClienteNombre(),
                delivery.getClienteUsername(),
                delivery.getClienteTelefono(),
                delivery.getDireccion(),
                delivery.getRepartidorId(),
                delivery.getRepartidor(),
                delivery.getCorreoCliente(),
                delivery.getFechaAsignacion(),
                delivery.getFechaEntrega(),
                delivery.getEstado()
        );
    }
}