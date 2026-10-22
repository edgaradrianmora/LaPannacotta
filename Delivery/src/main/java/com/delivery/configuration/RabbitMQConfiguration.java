package com.delivery.configuration;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfiguration {

    public static final String EXCHANGE = "PANNACOTTA_EXCHANGE";

    public static final String COLA_PEDIDO_CONFIRMADO_DELIVERY = "COLA_PEDIDO_CONFIRMADO_DELIVERY";

    public static final String COLA_DELIVERY_ASIGNADO  = "COLA_DELIVERY_ASIGNADO";
    public static final String COLA_DELIVERY_EN_CAMINO = "COLA_DELIVERY_EN_CAMINO";
    public static final String COLA_DELIVERY_ENTREGADO = "COLA_DELIVERY_ENTREGADO";

    public static final String RK_DELIVERY_ASIGNADO  = "delivery.asignado";
    public static final String RK_DELIVERY_EN_CAMINO = "delivery.en_camino";
    public static final String RK_DELIVERY_ENTREGADO = "delivery.entregado";

    @Bean
    TopicExchange topicExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    Queue colaPedidoConfirmadoDelivery() {
        return QueueBuilder.durable(COLA_PEDIDO_CONFIRMADO_DELIVERY).build();
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
    Binding bindingPedidoConfirmadoDelivery(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaPedidoConfirmadoDelivery())
                .to(topicExchange).with("pedido.confirmado");
    }

    @Bean
    Binding bindingDeliveryAsignado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryAsignado())
                .to(topicExchange).with(RK_DELIVERY_ASIGNADO);
    }

    @Bean
    Binding bindingDeliveryEnCamino(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryEnCamino())
                .to(topicExchange).with(RK_DELIVERY_EN_CAMINO);
    }

    @Bean
    Binding bindingDeliveryEntregado(TopicExchange topicExchange) {
        return BindingBuilder.bind(colaDeliveryEntregado())
                .to(topicExchange).with(RK_DELIVERY_ENTREGADO);
    }
}