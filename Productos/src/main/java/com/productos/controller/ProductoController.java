package com.productos.controller;

import java.util.List;

import com.productos.bean.dto.ProductoRequestDto;
import com.productos.bean.dto.ProductoResponseDto;
import com.productos.model.ProductoModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoModel productoModel;

    @GetMapping
    public List<ProductoResponseDto> Listar() {
        return productoModel.Listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> BuscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productoModel.BuscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> Registrar(@RequestBody ProductoRequestDto request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(productoModel.Registrar(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> Actualizar(
            @PathVariable Long id,
            @RequestBody ProductoRequestDto request) {
        try {
            return ResponseEntity.ok(productoModel.Actualizar(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> Eliminar(@PathVariable Long id) {
        try {
            productoModel.Eliminar(id);
            return ResponseEntity.ok("Producto eliminado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/descontar-stock")
    public ResponseEntity<Object> DescontarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad) {
        try {
            return ResponseEntity.ok(productoModel.DescontarStock(id, cantidad));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "MS Productos - La Pannacotta";
    }
}