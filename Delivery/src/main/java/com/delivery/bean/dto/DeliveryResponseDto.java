package com.delivery.bean.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponseDto {

    private Long id;
    private Long pedidoId;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccion;
    private String repartidor;
    private String correoCliente;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaEntrega;
    private String estado;
}