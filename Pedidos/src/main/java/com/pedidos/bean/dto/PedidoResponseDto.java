package com.pedidos.bean.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponseDto {

    private Long id;
    private String clienteNombre;
    private String clienteUsername;
    private String clienteTelefono;
    private String direccionEntrega;
    private String correoCliente;
    private LocalDateTime fecha;
    private Double total;
    private String estado;
    private List<DetallePedidoDto> detalle;
}