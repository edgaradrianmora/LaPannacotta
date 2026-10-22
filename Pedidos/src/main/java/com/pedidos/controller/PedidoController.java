package com.pedidos.controller;

import java.util.List;

import com.pedidos.bean.dto.PedidoRequest;
import com.pedidos.bean.dto.PedidoResponseDto;
import com.pedidos.model.PedidoModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;	

@RequiredArgsConstructor
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoModel pedidoModel;

    @GetMapping
    public List<PedidoResponseDto> Listar() {
        return pedidoModel.Listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> BuscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoModel.BuscarPorId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/mis-pedidos")
    public List<PedidoResponseDto> MisPedidos(Authentication authentication) {
        return pedidoModel.ListarPorUsuario(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<Object> Registrar(
            @RequestBody PedidoRequest request,
            Authentication authentication) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(pedidoModel.Registrar(request, authentication.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Object> Confirmar(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(pedidoModel.Confirmar(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> Eliminar(@PathVariable Long id) {
        try {
            pedidoModel.Eliminar(id);
            return ResponseEntity.ok("Pedido eliminado correctamente.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "MS Pedidos - La Pannacotta";
    }
}