package com.pedidos.bean.dto;

import lombok.Data;

@Data
public class ProductoDto {
    private Long id;
    private String nombre;
    private Double precio;
    private Integer stock;
}