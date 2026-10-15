package com.pedidos.controller;


import java.util.List;

import com.pedidos.bean.dto.PedidoRequest;
import com.pedidos.bean.entity.Pedido;
import com.pedidos.model.PedidoModel;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoModel pedidoModel;

    @GetMapping
    public List<Pedido> Listar() {
        return pedidoModel.Listar();
    }

    @GetMapping("/{id}")
    public Pedido BuscarPorId(@PathVariable Long id) {
        return pedidoModel.BuscarPorId(id);
    }

    @PostMapping
    public Pedido Registrar(@RequestBody PedidoRequest request) {
        return pedidoModel.Registrar(request);
    }

    @PutMapping("/{id}/confirmar")
    public Pedido Confirmar(@PathVariable Long id) {
        return pedidoModel.Confirmar(id);
    }

    @DeleteMapping("/{id}")
    public void Eliminar(@PathVariable Long id) {
        pedidoModel.Eliminar(id);
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "Pedidos ...!!!";
    }
}