package com.pedidos.bean.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDto {
    private Long id;
    private String nombre;
    private Double precio;
    private Integer stock;     // ← NUEVO
    private String estado;     // ← NUEVO
    private String categoria;
}