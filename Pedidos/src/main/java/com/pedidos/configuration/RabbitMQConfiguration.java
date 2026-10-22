package com.pedidos.configuration;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfiguration {

    public static final String EXCHANGE = "PANNACOTTA_EXCHANGE";

    public static final String COLA_PEDIDO_RECIBIDO             = "COLA_PEDIDO_RECIBIDO";
    public static final String COLA_PEDIDO_CONFIRMADO           = "COLA_PEDIDO_CONFIRMADO";
    public static final String COLA_PEDIDO_CONFIRMADO_DELIVERY  = "COLA_PEDIDO_CONFIRMADO_DELIVERY";

    public static final String RK_PEDIDO_RECIBIDO   = "pedido.recibido";
    public static final String RK_PEDIDO_CONFIRMADO = "pedido.confirmado";

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
    Queue colaPedidoConfirmadoDelivery() {
        return QueueBuilder.durable(COLA_PEDIDO_CONFIRMADO_DELIVERY).build();
    }

    @Bean
    Binding bindingPedidoRecibido(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoRecibido())
                .to(topicExchange).with(RK_PEDIDO_RECIBIDO);
    }

    @Bean
    Binding bindingPedidoConfirmado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoConfirmado())
                .to(topicExchange).with(RK_PEDIDO_CONFIRMADO);
    }

    @Bean
    Binding bindingPedidoConfirmadoDelivery(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoConfirmadoDelivery())
                .to(topicExchange).with(RK_PEDIDO_CONFIRMADO);
    }
}