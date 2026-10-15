package com.delivery.component;

import java.time.LocalDateTime;

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

    @RabbitListener(queues = RabbitMQConfiguration.QUEUE)
    public void Procesar(String mensaje) {
        System.out.println("Consumiendo: " + mensaje);

        try {
            String[] partes = mensaje.replace("PEDIDO_CONFIRMADO: ", "").split(" - ");

            Long pedidoId = Long.parseLong(partes[0].replace("Pedido N. ", "").trim());
            String clienteNombre = partes[1].replace("Cliente: ", "").trim();
            String direccion = partes[2].replace("Direccion: ", "").trim();

            Delivery delivery = new Delivery();
            delivery.setPedidoId(pedidoId);
            delivery.setClienteNombre(clienteNombre);
            delivery.setDireccion(direccion);
            delivery.setEstado("PENDIENTE");
            delivery.setFechaAsignacion(LocalDateTime.now());

            deliveryRepository.save(delivery);

            System.out.println("Delivery creado automaticamente para el pedido " + pedidoId);
        } catch (Exception e) {
            System.out.println("Error al procesar el mensaje de pedido confirmado: " + e.getMessage());
        }
    }
}