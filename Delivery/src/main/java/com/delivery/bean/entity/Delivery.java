package com.delivery.bean.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
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

    private Long pedidoId;
    private String clienteNombre;
    private String clienteUsername;   
    private String clienteTelefono;  
    private String direccion;
    private String repartidor;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaEntrega;
    private String correoCliente;
    private String estado;
}