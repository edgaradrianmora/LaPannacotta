package com.delivery.repository;

import com.delivery.bean.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    java.util.Optional<Delivery> findByPedidoId(Long pedidoId);
}