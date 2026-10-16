package com.pedidos.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.pedidos.bean.dto.ItemPedidoRequest;
import com.pedidos.bean.dto.PedidoRequest;
import com.pedidos.bean.dto.ProductoDto;
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

    public List<Pedido> Listar() {
        return pedidoRepository.findAll();
    }
    
    public List<Pedido> ListarPorUsuario(String username) {
        return pedidoRepository.findByClienteUsernameOrderByFechaDesc(username);
    }

    public Pedido BuscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    public Pedido Registrar(PedidoRequest request, String username) {
        Pedido pedido = new Pedido();
        pedido.setClienteUsername(username);
        pedido.setClienteNombre(request.getClienteNombre());
        pedido.setClienteTelefono(request.getClienteTelefono());
        pedido.setDireccionEntrega(request.getDireccionEntrega());
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado("PENDIENTE");

        List<DetallePedido> detalles = new ArrayList<>();
        double total = 0.0;

        for (ItemPedidoRequest item : request.getItems()) {
            ProductoDto producto = productoUseCase.BuscarPorId(item.getProductoId());

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

        return pedidoRepository.save(pedido);
    }

    public Pedido Confirmar(Long id) {
        Pedido pedido = BuscarPorId(id);

        for (DetallePedido detalle : pedido.getDetalle()) {
            productoUseCase.DescontarStock(detalle.getProductoId(), detalle.getCantidad());
        }

        pedido.setEstado("CONFIRMADO");
        Pedido confirmado = pedidoRepository.save(pedido);

        Publicar(confirmado);

        return confirmado;
    }

    public void Eliminar(Long id) {
        pedidoRepository.deleteById(id);
    }

    private void Publicar(Pedido pedido) {
        String mensaje = "PEDIDO_CONFIRMADO: Pedido N. " + pedido.getId()
                + " - Cliente: " + pedido.getClienteNombre()
                + " - Direccion: " + pedido.getDireccionEntrega()
                + " - Total: " + pedido.getTotal();

        rabbitTemplate.convertAndSend(RabbitMQConfiguration.EXCHANGE, RabbitMQConfiguration.ROUTING_KEY, mensaje);
        System.out.println("Envio: " + mensaje);
    }
}