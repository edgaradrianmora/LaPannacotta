package com.delivery.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.delivery.bean.entity.Repartidor;

public interface RepartidorRepository extends JpaRepository<Repartidor, Long> {

    List<Repartidor> findByEstadoOrderByNombreAsc(String estado);
}