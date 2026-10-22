package com.productos.model;

import java.util.List;
import java.util.stream.Collectors;

import com.productos.bean.dto.ProductoRequestDto;
import com.productos.bean.dto.ProductoResponseDto;
import com.productos.bean.entity.Producto;
import com.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ProductoModel {

    private final ProductoRepository productoRepository;

    public List<ProductoResponseDto> Listar() {
        return productoRepository.findAll()
                .stream()
                .map(this::ToResponseDto)
                .collect(Collectors.toList());
    }

    public ProductoResponseDto BuscarPorId(Long id) {
        return ToResponseDto(ObtenerEntidad(id));
    }

    public ProductoResponseDto Registrar(ProductoRequestDto request) {
        if (request.getNombre() == null || request.getNombre().isBlank())
            throw new RuntimeException("El nombre del producto es obligatorio.");
        if (request.getPrecio() == null || request.getPrecio() <= 0)
            throw new RuntimeException("El precio debe ser mayor a cero.");
        if (request.getStock() == null || request.getStock() < 0)
            throw new RuntimeException("El stock no puede ser negativo.");

        Producto p = new Producto();
        p.setNombre(request.getNombre());
        p.setDescripcion(request.getDescripcion());
        p.setPrecio(request.getPrecio());
        p.setStock(request.getStock());
        p.setCategoria(request.getCategoria());
        p.setImagenUrl(request.getImagenUrl());
        p.setEstado("ACTIVO");
        return ToResponseDto(productoRepository.save(p));
    }

    public ProductoResponseDto Actualizar(Long id, ProductoRequestDto request) {
        Producto p = ObtenerEntidad(id);
        if (request.getPrecio() != null && request.getPrecio() <= 0)
            throw new RuntimeException("El precio debe ser mayor a cero.");
        if (request.getStock() != null && request.getStock() < 0)
            throw new RuntimeException("El stock no puede ser negativo.");

        p.setNombre(request.getNombre());
        p.setDescripcion(request.getDescripcion());
        p.setPrecio(request.getPrecio());
        p.setStock(request.getStock());
        p.setCategoria(request.getCategoria());
        p.setImagenUrl(request.getImagenUrl());
        return ToResponseDto(productoRepository.save(p));
    }

    public void Eliminar(Long id) {
        ObtenerEntidad(id);
        productoRepository.deleteById(id);
    }

    public ProductoResponseDto DescontarStock(Long id, Integer cantidad) {
        Producto p = ObtenerEntidad(id);
        if (cantidad <= 0)
            throw new RuntimeException("La cantidad debe ser mayor a cero.");
        if (p.getStock() < cantidad)
            throw new RuntimeException("Stock insuficiente para " + p.getNombre()
                + ". Disponible: " + p.getStock() + ", solicitado: " + cantidad);
        p.setStock(p.getStock() - cantidad);
        return ToResponseDto(productoRepository.save(p));
    }

    private Producto ObtenerEntidad(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                    "Producto no encontrado con id: " + id));
    }

    private ProductoResponseDto ToResponseDto(Producto p) {
        return new ProductoResponseDto(
                p.getId(), p.getNombre(), p.getDescripcion(),
                p.getPrecio(), p.getStock(), p.getCategoria(),
                p.getEstado(), p.getImagenUrl());
    }
}