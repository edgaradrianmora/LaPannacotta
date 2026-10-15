package com.productos.controller;

import java.util.List;

import com.productos.bean.entity.Producto;
import com.productos.model.ProductoModel;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoModel productoModel;

    @GetMapping
    public List<Producto> Listar() {
        return productoModel.Listar();
    }

    @GetMapping("/{id}")
    public Producto BuscarPorId(@PathVariable Long id) {
        return productoModel.BuscarPorId(id);
    }

    @PostMapping
    public Producto Registrar(@RequestBody Producto producto) {
        return productoModel.Registrar(producto);
    }

    @PutMapping("/{id}")
    public Producto Actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return productoModel.Actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    public void Eliminar(@PathVariable Long id) {
        productoModel.Eliminar(id);
    }

    @PutMapping("/{id}/descontar-stock")
    public Producto DescontarStock(@PathVariable Long id, @RequestParam Integer cantidad) {
        return productoModel.DescontarStock(id, cantidad);
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "Productos";
    }
}