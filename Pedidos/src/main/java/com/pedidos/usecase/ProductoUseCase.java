package com.pedidos.usecase;


import com.pedidos.bean.dto.ProductoDto;
import org.springframework.stereotype.Component;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class ProductoUseCase {

    private final ProductoClient productoClient;

    @CircuitBreaker(name = "productos", fallbackMethod = "BuscarPorIdFallback")
    public ProductoDto BuscarPorId(Long id) {
        return productoClient.BuscarPorId(id);
    }

    @CircuitBreaker(name = "productos", fallbackMethod = "DescontarStockFallback")
    public ProductoDto DescontarStock(Long id, Integer cantidad) {
        return productoClient.DescontarStock(id, cantidad);
    }

    private ProductoDto BuscarPorIdFallback(Long id, Throwable t) {
        throw new RuntimeException("El servicio de Productos no esta disponible en este momento. Intenta nuevamente en unos segundos.");
    }

    private ProductoDto DescontarStockFallback(Long id, Integer cantidad, Throwable t) {
        throw new RuntimeException("El servicio de Productos no esta disponible en este momento. Intenta nuevamente en unos segundos.");
    }
}