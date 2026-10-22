package com.productos.bean.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponseDto {
    private Long id;
    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer stock;
    private String categoria;
    private String estado;
    private String imagenUrl;
}