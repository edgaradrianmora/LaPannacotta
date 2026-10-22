package com.pedidos.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.pedidos.bean.dto.*;
import com.pedidos.bean.entity.DetallePedido;
import com.pedidos.bean.entity.Pedido;
import com.pedidos.configuration.RabbitMQConfiguration;
import com.pedidos.repository.PedidoRepository;
import com.pedidos.usecase.ProductoUseCase;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class PedidoModel {

    private final PedidoRepository pedidoRepository;
    private final ProductoUseCase productoUseCase;
    private final RabbitTemplate rabbitTemplate;

    private static final List<String> ESTADOS_VALIDOS =
            List.of("PENDIENTE", "CONFIRMADO", "CANCELADO");

    public List<PedidoResponseDto> Listar() {
        return pedidoRepository.findAll()
                .stream()
                .map(this::ToResponseDto)
                .collect(Collectors.toList());
    }

    public List<PedidoResponseDto> ListarPorUsuario(String username) {
        return pedidoRepository.findByClienteUsernameOrderByFechaDesc(username)
                .stream()
                .map(this::ToResponseDto)
                .collect(Collectors.toList());
    }

    public PedidoResponseDto BuscarPorId(Long id) {
        Pedido pedido = ObtenerEntidad(id);
        return ToResponseDto(pedido);
    }

    public PedidoResponseDto Registrar(PedidoRequest request, String username) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("El pedido debe tener al menos un producto.");
        }

        if (request.getClienteNombre() == null || request.getClienteNombre().isBlank()) {
            throw new RuntimeException("El nombre del cliente es obligatorio.");
        }
        if (request.getDireccionEntrega() == null || request.getDireccionEntrega().isBlank()) {
            throw new RuntimeException("La dirección de entrega es obligatoria.");
        }

        Pedido pedido = new Pedido();
        pedido.setClienteUsername(username);
        pedido.setClienteNombre(request.getClienteNombre());
        pedido.setClienteTelefono(request.getClienteTelefono());
        pedido.setDireccionEntrega(request.getDireccionEntrega());
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");
        pedido.setCorreoCliente(request.getCorreoCliente());

        List<DetallePedido> detalles = new ArrayList<>();
        double total = 0.0;

        for (ItemPedidoRequest item : request.getItems()) {

            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new RuntimeException("La cantidad debe ser mayor a cero.");
            }

            ProductoDto producto = productoUseCase.BuscarPorId(item.getProductoId());

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException(
                    "Stock insuficiente para '" + producto.getNombre() + "'. "
                    + "Disponible: " + producto.getStock()
                    + ", solicitado: " + item.getCantidad() + ".");
            }

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProductoId(producto.getId());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio() * item.getCantidad());

            total += detalle.getSubtotal();
            detalles.add(detalle);
        }

        pedido.setDetalle(detalles);
        pedido.setTotal(total);

        Pedido guardado = pedidoRepository.save(pedido);

        PublicarEvento(guardado, RabbitMQConfiguration.RK_PEDIDO_RECIBIDO, "PEDIDO_CREADO");

        return ToResponseDto(guardado);
    }

    public PedidoResponseDto Confirmar(Long id) {
        Pedido pedido = ObtenerEntidad(id);

        if (!"PENDIENTE".equals(pedido.getEstado())) {
            throw new RuntimeException(
                "No se puede confirmar un pedido en estado: " + pedido.getEstado()
                + ". Solo se pueden confirmar pedidos en estado PENDIENTE.");
        }

        for (DetallePedido detalle : pedido.getDetalle()) {
            productoUseCase.DescontarStock(detalle.getProductoId(), detalle.getCantidad());
        }

        pedido.setEstado("CONFIRMADO");
        Pedido confirmado = pedidoRepository.save(pedido);

        PublicarEvento(confirmado, RabbitMQConfiguration.RK_PEDIDO_CONFIRMADO, "PEDIDO_CONFIRMADO");

        return ToResponseDto(confirmado);
    }

    public void Eliminar(Long id) {
        Pedido pedido = ObtenerEntidad(id);

        if ("CONFIRMADO".equals(pedido.getEstado())) {
            throw new RuntimeException(
                "No se puede eliminar un pedido ya confirmado.");
        }

        pedidoRepository.deleteById(id);
    }

    private Pedido ObtenerEntidad(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con id: " + id));
    }

    private void PublicarEvento(Pedido pedido, String routingKey, String tipoEvento) {
        PedidoEventoDto evento = new PedidoEventoDto(
                pedido.getId(),
                pedido.getClienteNombre(),
                pedido.getClienteUsername(),
                pedido.getClienteTelefono(),
                pedido.getDireccionEntrega(),
                pedido.getCorreoCliente(),
                pedido.getTotal(),
                pedido.getEstado(),
                tipoEvento
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfiguration.EXCHANGE,
                routingKey,
                evento
        );

        System.out.println("[RabbitMQ] Publicado '" + routingKey
                + "' Pedido #" + pedido.getId()
                + " correo: " + pedido.getCorreoCliente());
    }

    private PedidoResponseDto ToResponseDto(Pedido p) {
        List<DetallePedidoDto> detalleDto = p.getDetalle() == null
                ? List.of()
                : p.getDetalle().stream()
                    .map(d -> new DetallePedidoDto(
                            d.getId(),
                            d.getProductoId(),
                            null,             
                            d.getCantidad(),
                            d.getPrecioUnitario(),
                            d.getSubtotal()))
                    .collect(Collectors.toList());

        return new PedidoResponseDto(
                p.getId(),
                p.getClienteNombre(),
                p.getClienteUsername(),
                p.getClienteTelefono(),
                p.getDireccionEntrega(),
                p.getCorreoCliente(),
                p.getFecha(),
                p.getTotal(),
                p.getEstado(),
                detalleDto
        );
    }
}