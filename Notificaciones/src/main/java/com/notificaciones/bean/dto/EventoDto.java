package com.notificaciones.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventoDto {

    private Long pedidoId;
    private Long deliveryId;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccionEntrega;
    private String direccion;
    private String repartidor;
    private Double total;
    private String correo; 
    private String estado;
    private String eventoTipo;
}