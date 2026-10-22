package com.delivery.controller;

import java.util.List;

import com.delivery.bean.dto.DeliveryActualizarRequest;
import com.delivery.bean.dto.DeliveryRegistrarRequest;
import com.delivery.bean.dto.DeliveryResponseDto;
import com.delivery.bean.entity.Delivery;
import com.delivery.model.DeliveryModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/delivery")
public class DeliveryController {

    private final DeliveryModel deliveryModel;

    @GetMapping
    public List<DeliveryResponseDto> Listar() {
        return deliveryModel.Listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> BuscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(deliveryModel.BuscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<Object> BuscarPorPedido(@PathVariable Long pedidoId) {
        DeliveryResponseDto dto = deliveryModel.BuscarPorPedido(pedidoId);
        return dto != null
                ? ResponseEntity.ok(dto)
                : ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No hay delivery para el pedido #" + pedidoId);
    }

    @PostMapping
    public ResponseEntity<Object> Registrar(@RequestBody DeliveryRegistrarRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(deliveryModel.Registrar(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> Actualizar(
            @PathVariable Long id,
            @RequestBody DeliveryActualizarRequest request) {
        try {
            return ResponseEntity.ok(deliveryModel.Actualizar(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> Eliminar(@PathVariable Long id) {
        try {
            deliveryModel.Eliminar(id);
            return ResponseEntity.ok("Delivery eliminado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "MS Delivery - La Pannacotta";
    }
}