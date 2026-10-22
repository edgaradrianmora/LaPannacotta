package com.delivery.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryEventoDto {

    private Long deliveryId;
    private Long pedidoId;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccion;
    private String repartidor;
    private String correo;
    private String estado;
    private String eventoTipo;
}