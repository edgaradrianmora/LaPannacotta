package com.pedidos.bean.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PedidoEventoDto {

    private Long pedidoId;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccionEntrega;
    private String correo;
    private Double total;
    private String estado;
    private String eventoTipo; 
}