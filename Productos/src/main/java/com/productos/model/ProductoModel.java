package com.productos.model;

import java.util.List;

import com.productos.bean.entity.Producto;
import com.productos.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class ProductoModel {

    private final ProductoRepository productoRepository;

    public List<Producto> Listar() {
        return productoRepository.findAll();
    }

    public Producto BuscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Producto Registrar(Producto producto) {
        producto.setEstado("ACTIVO");
        return productoRepository.save(producto);
    }

    public Producto Actualizar(Long id, Producto datos) {
        Producto producto = BuscarPorId(id);
        producto.setNombre(datos.getNombre());
        producto.setDescripcion(datos.getDescripcion());
        producto.setPrecio(datos.getPrecio());
        producto.setStock(datos.getStock());
        producto.setCategoria(datos.getCategoria());
        producto.setImagenUrl(datos.getImagenUrl());
        return productoRepository.save(producto);
    }

    public void Eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    public Producto DescontarStock(Long id, Integer cantidad) {
        Producto producto = BuscarPorId(id);
        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente para " + producto.getNombre());
        }
        producto.setStock(producto.getStock() - cantidad);
        return productoRepository.save(producto);
    }
}