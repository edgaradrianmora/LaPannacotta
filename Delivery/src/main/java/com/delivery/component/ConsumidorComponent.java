package com.delivery.component;

import java.time.LocalDateTime;

import com.delivery.bean.dto.PedidoEventoDto;
import com.delivery.bean.entity.Delivery;
import com.delivery.configuration.RabbitMQConfiguration;
import com.delivery.repository.DeliveryRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ConsumidorComponent {

    private final DeliveryRepository deliveryRepository;

    @RabbitListener(queues = RabbitMQConfiguration.COLA_PEDIDO_CONFIRMADO_DELIVERY)
    public void ProcesarPedidoConfirmado(PedidoEventoDto evento) {

        System.out.println("[RabbitMQ] Recibido evento: " + evento.getEventoTipo()
                + " - Pedido #" + evento.getPedidoId());

        boolean yaExiste = deliveryRepository
                .findByPedidoId(evento.getPedidoId()).isPresent();
        if (yaExiste) {
            System.out.println("[RabbitMQ] Delivery ya existe para pedido #"
                    + evento.getPedidoId() + ". Se ignora.");
            return;
        }

        Delivery delivery = new Delivery();
        delivery.setPedidoId(evento.getPedidoId());
        delivery.setClienteNombre(evento.getClienteNombre());
        delivery.setClienteUsername(evento.getClienteUsername());
        delivery.setClienteTelefono(evento.getClienteTelefono());
        delivery.setDireccion(evento.getDireccionEntrega());
        delivery.setCorreoCliente(evento.getCorreo()); 
        delivery.setEstado("PENDIENTE");
        delivery.setFechaAsignacion(LocalDateTime.now());

        deliveryRepository.save(delivery);

        System.out.println("[RabbitMQ] ✅ Delivery creado para pedido #"
                + evento.getPedidoId()
                + " correo: " + evento.getCorreo());
    }
}