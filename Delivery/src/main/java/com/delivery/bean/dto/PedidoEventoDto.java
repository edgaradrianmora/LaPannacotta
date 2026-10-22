package com.delivery.bean.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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