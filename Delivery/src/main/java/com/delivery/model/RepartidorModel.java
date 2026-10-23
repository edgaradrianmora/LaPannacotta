package com.delivery.model;

import java.util.List;

import org.springframework.stereotype.Service;

import com.delivery.bean.entity.Repartidor;
import com.delivery.repository.RepartidorRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RepartidorModel {

    private final RepartidorRepository repartidorRepository;

    public List<Repartidor> Listar() {
        return repartidorRepository.findAll();
    }

    public List<Repartidor> ListarActivos() {
        return repartidorRepository.findByEstadoOrderByNombreAsc("ACTIVO");
    }

    public Repartidor BuscarPorId(Long id) {
        return repartidorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Repartidor no encontrado con id: " + id));
    }

    public Repartidor Registrar(Repartidor repartidor) {
        if (repartidor.getNombre() == null || repartidor.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del repartidor es obligatorio.");
        }

        repartidor.setNombre(repartidor.getNombre().trim());

        if (repartidor.getTelefono() != null) {
            repartidor.setTelefono(repartidor.getTelefono().trim());
        }

        repartidor.setEstado("ACTIVO");

        return repartidorRepository.save(repartidor);
    }

    public Repartidor Actualizar(Long id, Repartidor request) {
        Repartidor repartidor = BuscarPorId(id);

        if (request.getNombre() == null || request.getNombre().isBlank()) {
            throw new RuntimeException("El nombre del repartidor es obligatorio.");
        }

        repartidor.setNombre(request.getNombre().trim());

        if (request.getTelefono() != null) {
            repartidor.setTelefono(request.getTelefono().trim());
        }

        if (request.getEstado() != null
                && ("ACTIVO".equalsIgnoreCase(request.getEstado())
                    || "INACTIVO".equalsIgnoreCase(request.getEstado()))) {
            repartidor.setEstado(request.getEstado().toUpperCase());
        }

        return repartidorRepository.save(repartidor);
    }

    public void Desactivar(Long id) {
        Repartidor repartidor = BuscarPorId(id);
        repartidor.setEstado("INACTIVO");
        repartidorRepository.save(repartidor);
    }
}