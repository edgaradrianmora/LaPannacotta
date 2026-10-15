package com.pedidos.usecase;


import com.pedidos.bean.dto.ProductoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "Productos")
public interface ProductoClient {

    @GetMapping("/productos/{id}")
    ProductoDto BuscarPorId(@PathVariable Long id);

    @PutMapping("/productos/{id}/descontar-stock")
    ProductoDto DescontarStock(@PathVariable Long id, @RequestParam Integer cantidad);
}