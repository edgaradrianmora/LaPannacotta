package com.productos.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.productos.bean.entity.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class ProductoRepositoryTest {

    @Autowired
    private ProductoRepository productoRepository;

    private Producto producto;

    @BeforeEach
    void setUp() {
        producto = new Producto();
        producto.setNombre("Torta de Vainilla");
        producto.setDescripcion("Torta de vainilla con fresas");
        producto.setPrecio(55.0);
        producto.setStock(20);
        producto.setCategoria("Tortas");
        producto.setEstado("ACTIVO");
    }

    @Test
    void DebeInsertarProducto() {
        Producto guardado = productoRepository.save(producto);
        assertThat(guardado.getId()).isNotNull();
        assertThat(guardado.getNombre()).isEqualTo("Torta de Vainilla");
    }

    @Test
    void DebeListarProductos() {
        productoRepository.save(producto);
        List<Producto> productos = productoRepository.findAll();
        assertThat(productos).isNotEmpty();
    }

    @Test
    void DebeActualizarProducto() {
        Producto guardado = productoRepository.save(producto);
        guardado.setPrecio(70.0);
        guardado.setStock(15);
        Producto actualizado = productoRepository.save(guardado);
        assertThat(actualizado.getPrecio()).isEqualTo(70.0);
        assertThat(actualizado.getStock()).isEqualTo(15);
    }

    @Test
    void DebeEliminarProducto() {
        Producto guardado = productoRepository.save(producto);
        Long id = guardado.getId();
        productoRepository.deleteById(id);
        Optional<Producto> resultado = productoRepository.findById(id);
        assertThat(resultado).isEmpty();
    }
}