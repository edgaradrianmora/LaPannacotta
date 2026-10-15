package com.pedidos.bean.dto;

import java.util.List;

import lombok.Data;

@Data
public class PedidoRequest {
    private String clienteNombre;
    private String clienteTelefono;
    private String direccionEntrega;
    private List<ItemPedidoRequest> items;
}