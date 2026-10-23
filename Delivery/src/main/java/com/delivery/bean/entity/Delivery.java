package com.delivery.bean.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "delivery")
@Data
@NoArgsConstructor
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pedido_id", nullable = false, unique = true)
    private Long pedidoId;

    private String clienteNombre;

    private String clienteUsername;

    private String clienteTelefono;

    private String direccion;

    private Long repartidorId;

    private String repartidor;

    private LocalDateTime fechaAsignacion;

    private LocalDateTime fechaEntrega;

    private String correoCliente;

    private String estado;
}