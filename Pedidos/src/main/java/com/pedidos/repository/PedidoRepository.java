package com.pedidos.repository;
import com.pedidos.bean.entity.Pedido;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteUsernameOrderByFechaDesc(String clienteUsername);
}