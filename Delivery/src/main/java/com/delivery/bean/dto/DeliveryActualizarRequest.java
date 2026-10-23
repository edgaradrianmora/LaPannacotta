package com.delivery.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryActualizarRequest {

    private Long repartidorId;

    private String repartidor;

    private String estado;
}