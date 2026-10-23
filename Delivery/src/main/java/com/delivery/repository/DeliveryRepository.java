package com.delivery.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.delivery.bean.entity.Delivery;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByPedidoId(Long pedidoId);

    boolean existsByPedidoId(Long pedidoId);
}