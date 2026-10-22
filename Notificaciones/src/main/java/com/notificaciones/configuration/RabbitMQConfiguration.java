package com.notificaciones.configuration;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfiguration {

    public static final String EXCHANGE = "PANNACOTTA_EXCHANGE";

    public static final String COLA_PEDIDO_RECIBIDO    = "COLA_PEDIDO_RECIBIDO";
    public static final String COLA_PEDIDO_CONFIRMADO  = "COLA_PEDIDO_CONFIRMADO";
    public static final String COLA_DELIVERY_ASIGNADO  = "COLA_DELIVERY_ASIGNADO";
    public static final String COLA_DELIVERY_EN_CAMINO = "COLA_DELIVERY_EN_CAMINO";
    public static final String COLA_DELIVERY_ENTREGADO = "COLA_DELIVERY_ENTREGADO";

    @Bean
    TopicExchange topicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    Queue colaPedidoRecibido() {
        return QueueBuilder.durable(COLA_PEDIDO_RECIBIDO).build();
    }

    @Bean
    Queue colaPedidoConfirmado() {
        return QueueBuilder.durable(COLA_PEDIDO_CONFIRMADO).build();
    }

    @Bean
    Queue colaDeliveryAsignado() {
        return QueueBuilder.durable(COLA_DELIVERY_ASIGNADO).build();
    }

    @Bean
    Queue colaDeliveryEnCamino() {
        return QueueBuilder.durable(COLA_DELIVERY_EN_CAMINO).build();
    }

    @Bean
    Queue colaDeliveryEntregado() {
        return QueueBuilder.durable(COLA_DELIVERY_ENTREGADO).build();
    }

    @Bean
    Binding bindingPedidoRecibido(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoRecibido())
                .to(topicExchange).with("pedido.recibido");
    }

    @Bean
    Binding bindingPedidoConfirmado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoConfirmado())
                .to(topicExchange).with("pedido.confirmado");
    }

    @Bean
    Binding bindingDeliveryAsignado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryAsignado())
                .to(topicExchange).with("delivery.asignado");
    }

    @Bean
    Binding bindingDeliveryEnCamino(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryEnCamino())
                .to(topicExchange).with("delivery.en_camino");
    }

    @Bean
    Binding bindingDeliveryEntregado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryEntregado())
                .to(topicExchange).with("delivery.entregado");
    }
}