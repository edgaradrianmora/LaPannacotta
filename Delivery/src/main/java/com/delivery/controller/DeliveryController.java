package com.delivery.controller;

import java.util.List;

import com.delivery.bean.entity.Delivery;
import com.delivery.model.DeliveryModel;
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
@RequestMapping("/delivery")
public class DeliveryController {

    private final DeliveryModel deliveryModel;

    @GetMapping
    public List<Delivery> Listar() {
        return deliveryModel.Listar();
    }

    @GetMapping("/{id}")
    public Delivery BuscarPorId(@PathVariable Long id) {
        return deliveryModel.BuscarPorId(id);
    }

    @PostMapping
    public Delivery Registrar(@RequestBody Delivery delivery) {
        return deliveryModel.Registrar(delivery);
    }

    @PutMapping("/{id}")
    public Delivery Actualizar(@PathVariable Long id, @RequestBody Delivery delivery) {
        return deliveryModel.Actualizar(id, delivery);
    }

    @DeleteMapping("/{id}")
    public void Eliminar(@PathVariable Long id) {
        deliveryModel.Eliminar(id);
    }

    @GetMapping("/aviso")
    public String Aviso() {
        return "Delivery ...!!!";
    }
}