package com.delivery.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.delivery.bean.entity.Repartidor;
import com.delivery.model.RepartidorModel;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/delivery/repartidores")
public class RepartidorController {

    private final RepartidorModel repartidorModel;

    @GetMapping
    public List<Repartidor> Listar() {
        return repartidorModel.Listar();
    }

    @GetMapping("/activos")
    public List<Repartidor> ListarActivos() {
        return repartidorModel.ListarActivos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> BuscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(repartidorModel.BuscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<Object> Registrar(@RequestBody Repartidor repartidor) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(repartidorModel.Registrar(repartidor));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> Actualizar(
            @PathVariable Long id,
            @RequestBody Repartidor repartidor) {
        try {
            return ResponseEntity.ok(
                    repartidorModel.Actualizar(id, repartidor));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> Desactivar(@PathVariable Long id) {
        try {
            repartidorModel.Desactivar(id);
            return ResponseEntity.ok(
                    "Repartidor desactivado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}