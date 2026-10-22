package com.notificaciones.component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notificaciones.bean.dto.EventoDto;
import com.notificaciones.configuration.RabbitMQConfiguration;
import com.notificaciones.service.EmailService; // Asegúrate de importar tu servicio de correo
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
@Component
public class NotificacionComponent {

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final ObjectMapper objectMapper;
    private final EmailService emailService; 

    @RabbitListener(
        queues = RabbitMQConfiguration.COLA_PEDIDO_RECIBIDO,
        ackMode = "MANUAL"
    )
    public void ProcesarPedidoRecibido(
            Message message, Channel channel) throws IOException {

        EventoDto evento = parsear(message);
        imprimir("📦 [COLA_PEDIDO_RECIBIDO] NUEVO PEDIDO",
                "Cliente  : " + evento.getClienteNombre(),
                "Username : " + evento.getClienteUsername(),
                "Pedido # : " + evento.getPedidoId(),
                "Total    : S/ " + evento.getTotal(),
                "Dirección: " + evento.getDireccionEntrega(),
                "→ Notificación: Pedido #" + evento.getPedidoId()
                + " recibido. Total S/ " + evento.getTotal());

        emailService.Enviar(
            evento.getCorreo(),
            "🍰 La Pannacotta - Pedido #" + evento.getPedidoId() + " recibido",
            "Hola " + evento.getClienteNombre() + ",\n\n"
            + "Tu pedido #" + evento.getPedidoId() + " fue recibido.\n"
            + "Total: S/ " + evento.getTotal() + "\n"
            + "Dirección: " + evento.getDireccionEntrega() + "\n\n"
            + "¡Gracias por elegir La Pannacotta! 🍮"
        );

        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    @RabbitListener(
        queues = RabbitMQConfiguration.COLA_PEDIDO_CONFIRMADO,
        ackMode = "MANUAL"
    )
    public void ProcesarPedidoConfirmado(
            Message message, Channel channel) throws IOException {

        EventoDto evento = parsear(message);
        imprimir("✅ [COLA_PEDIDO_CONFIRMADO] PEDIDO CONFIRMADO",
                "Cliente  : " + evento.getClienteNombre(),
                "Pedido # : " + evento.getPedidoId(),
                "→ Notificación: Pedido #" + evento.getPedidoId()
                + " confirmado. Estamos preparándolo.");

        emailService.Enviar(
            evento.getCorreo(),
            "✅ La Pannacotta - Pedido #" + evento.getPedidoId() + " confirmado",
            "Hola " + evento.getClienteNombre() + ",\n\n"
            + "Tu pedido #" + evento.getPedidoId() + " fue confirmado.\n"
            + "¡Estamos preparándolo con mucho amor! 🎂"
        );

        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    @RabbitListener(
        queues = RabbitMQConfiguration.COLA_DELIVERY_ASIGNADO,
        ackMode = "MANUAL"
    )
    public void ProcesarDeliveryAsignado(
            Message message, Channel channel) throws IOException {

        EventoDto evento = parsear(message);
        imprimir("🛵 [COLA_DELIVERY_ASIGNADO] REPARTIDOR ASIGNADO",
                "Cliente    : " + evento.getClienteNombre(),
                "Pedido #   : " + evento.getPedidoId(),
                "Repartidor : " + evento.getRepartidor(),
                "→ Notificación: Repartidor "
                + evento.getRepartidor() + " asignado al pedido #"
                + evento.getPedidoId());

        emailService.Enviar(
            evento.getCorreo(),
            "🛵 La Pannacotta - Repartidor asignado",
            "Hola " + evento.getClienteNombre() + ",\n\n"
            + "Tu pedido #" + evento.getPedidoId()
            + " tiene repartidor asignado: " + evento.getRepartidor() + "\n"
            + "¡Pronto estará en camino!"
        );

        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    @RabbitListener(
        queues = RabbitMQConfiguration.COLA_DELIVERY_EN_CAMINO,
        ackMode = "MANUAL"
    )
    public void ProcesarDeliveryEnCamino(
            Message message, Channel channel) throws IOException {

        EventoDto evento = parsear(message);
        imprimir("🚀 [COLA_DELIVERY_EN_CAMINO] PEDIDO EN CAMINO",
                "Cliente    : " + evento.getClienteNombre(),
                "Pedido #   : " + evento.getPedidoId(),
                "Repartidor : " + evento.getRepartidor(),
                "Dirección  : " + (evento.getDireccion() != null
                        ? evento.getDireccion()
                        : evento.getDireccionEntrega()),
                "→ Notificación: Pedido #" + evento.getPedidoId()
                + " va en camino con " + evento.getRepartidor());

        emailService.Enviar(
            evento.getCorreo(),
            "🚀 La Pannacotta - ¡Tu pedido va en camino!",
            "Hola " + evento.getClienteNombre() + ",\n\n"
            + "¡Tu pedido #" + evento.getPedidoId() + " está en camino!\n"
            + "Repartidor: " + evento.getRepartidor() + "\n"
            + "Dirección: " + evento.getDireccion()
        );

        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    @RabbitListener(
        queues = RabbitMQConfiguration.COLA_DELIVERY_ENTREGADO,
        ackMode = "MANUAL"
    )
    public void ProcesarDeliveryEntregado(
            Message message, Channel channel) throws IOException {

        EventoDto evento = parsear(message);
        imprimir("🎉 [COLA_DELIVERY_ENTREGADO] PEDIDO ENTREGADO",
                "Cliente  : " + evento.getClienteNombre(),
                "Pedido # : " + evento.getPedidoId(),
                "→ Notificación: ¡Pedido #" + evento.getPedidoId()
                + " entregado! ¡Que lo disfrutes!");

        emailService.Enviar(
            evento.getCorreo(),
            "🎉 La Pannacotta - ¡Pedido entregado!",
            "Hola " + evento.getClienteNombre() + ",\n\n"
            + "¡Tu pedido #" + evento.getPedidoId() + " fue entregado!\n"
            + "¡Que lo disfrutes! 🍮\n\n"
            + "Gracias por confiar en La Pannacotta."
        );

        channel.basicAck(message.getMessageProperties().getDeliveryTag(), false);
    }

    private EventoDto parsear(Message message) {
        try {
            return objectMapper.readValue(message.getBody(), EventoDto.class);
        } catch (Exception e) {
            EventoDto fallback = new EventoDto();
            fallback.setClienteNombre("Mensaje manual");
            fallback.setPedidoId(0L);
            fallback.setTotal(0.0);
            fallback.setDireccionEntrega(new String(message.getBody()));
            return fallback;
        }
    }
    
    

    private void imprimir(String titulo, String... lineas) {
        String sep = "═".repeat(65);
        System.out.println("\n" + sep);
        System.out.println("  " + LocalDateTime.now().format(FMT));
        System.out.println("  " + titulo);
        System.out.println("  " + "─".repeat(60));
        for (String linea : lineas) {
            System.out.println("  " + linea);
        }
        System.out.println(sep + "\n");
    }
}