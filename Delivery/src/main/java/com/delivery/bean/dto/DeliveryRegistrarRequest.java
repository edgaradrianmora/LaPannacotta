package com.delivery.bean.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRegistrarRequest {
    private Long pedidoId;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccion;
}