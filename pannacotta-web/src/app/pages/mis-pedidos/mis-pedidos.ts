import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';
import { DeliveryService } from '../../services/delivery.service';
import { ProductoService } from '../../services/producto.service';
import { Delivery, DetallePedido, Pedido, Producto } from '../../core/models';
import { mensajeError } from '../../core/errores';
import { Foto } from '../../shared/foto';

const PASOS = ['Recibido', 'Confirmado', 'Repartidor asignado', 'En camino', 'Entregado'];

@Component({
  selector: 'app-mis-pedidos',
  imports: [CurrencyPipe, DatePipe, RouterLink, Foto],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Mis pedidos</h1>
        <p>Sigue cada pedido en tiempo real</p>
      </div>
      <a class="btn" routerLink="/tienda">Hacer otro pedido</a>
    </div>

    @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }

    @for (p of pedidos(); track p.id) {
      <article class="tarjeta pedido">
        <header>
          <div>
            <h2>Pedido #{{ p.id }}</h2>
            <small>{{ p.fecha | date: 'dd/MM/yyyy HH:mm' }} · {{ p.direccionEntrega }}</small>
          </div>
          <strong class="monto">{{ p.total | currency: 'S/ ' }}</strong>
        </header>

        <ol class="pasos" [attr.aria-label]="'Estado del pedido ' + p.id">
          @for (nombre of pasos; track nombre; let i = $index) {
            <li [class.hecho]="i <= avance(p)" [class.actual]="i === avance(p)">
              <span class="punto">{{ i <= avance(p) ? '✓' : i + 1 }}</span>
              <span class="txt">{{ nombre }}</span>
            </li>
          }
        </ol>

        <p class="resumen">
          @if (avance(p) === 0) { Tu pedido fue recibido. La pastelería lo confirmará en breve. }
          @else if (avance(p) === 1) { Pedido confirmado. Estamos preparándolo y buscando repartidor. }
          @else if (avance(p) === 2) { Tu repartidor es <strong>{{ entrega(p)?.repartidor }}</strong>. Saldrá en breve. }
          @else if (avance(p) === 3) { <strong>{{ entrega(p)?.repartidor }}</strong> va en camino a tu dirección. }
          @else { ¡Entregado! Que lo disfrutes. }
        </p>

        <ul class="lineas">
          @for (d of lineas(p); track $index) {
            <li>
              <span class="mini"><app-foto [nombre]="nombre(d)" [imagen]="producto(d.productoId)?.imagenUrl" /></span>
              <span>{{ d.cantidad }} × {{ nombre(d) }}</span>
              @if (d.subtotal != null) { <span class="sub">{{ d.subtotal | currency: 'S/ ' }}</span> }
            </li>
          }
        </ul>
      </article>
    } @empty {
      <div class="tarjeta"><p class="vacio">{{ cargando() ? 'Cargando tus pedidos…' : 'Todavía no tienes pedidos. ¡Anímate con un postre!' }}</p></div>
    }

    @if (actualizado()) { <p class="act">Última actualización: {{ actualizado() | date: 'HH:mm:ss' }}</p> }
  `,
  styles: `
    a.btn { text-decoration: none; color: #fff; }
    .pedido { margin-bottom: 18px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
    header small { color: var(--suave); }
    .monto { font-family: var(--serif); font-size: 1.3rem; color: var(--frambuesa); font-weight: 400; }
    .pasos { list-style: none; display: grid; grid-template-columns: repeat(5, 1fr); margin: 0 0 14px; padding: 0; }
    .pasos li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-size: .78rem; color: var(--suave); }
    .pasos li::before { content: ''; position: absolute; top: 15px; right: 50%; width: 100%; height: 3px; background: var(--borde); z-index: 0; }
    .pasos li:first-child::before { display: none; }
    .pasos li.hecho::before { background: var(--pistacho); }
    .punto { position: relative; z-index: 1; width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--papel); border: 2px solid var(--borde); font-weight: 700; font-size: .85rem; }
    .pasos li.hecho .punto { background: var(--pistacho); border-color: var(--pistacho); color: #fff; }
    .pasos li.actual .punto { box-shadow: 0 0 0 5px var(--pistacho-claro); }
    .pasos li.hecho { color: var(--tinta); font-weight: 600; }
    .resumen { background: var(--leche); border-radius: 14px; padding: 11px 15px; margin: 0 0 14px; }
    .lineas { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .lineas li { display: grid; grid-template-columns: 36px 1fr auto; gap: 10px; align-items: center; font-size: .92rem; }
    .mini { width: 36px; height: 36px; border-radius: 10px; overflow: hidden; background: var(--leche); font-size: .5rem; }
    .sub { color: var(--suave); }
    .act { color: var(--suave); font-size: .8rem; text-align: right; }
    @media (max-width: 600px) { .pasos li .txt { font-size: .66rem; } }
  `
})
export class MisPedidos implements OnInit {
  private pedSrv = inject(PedidoService);
  private delSrv = inject(DeliveryService);
  private prodSrv = inject(ProductoService);
  private destroyRef = inject(DestroyRef);

  pasos = PASOS;
  pedidos = signal<Pedido[]>([]);
  entregas = signal<Record<number, Delivery | null>>({});
  productos = signal<Producto[]>([]);
  cargando = signal(true);
  error = signal('');
  actualizado = signal<Date | null>(null);

  ngOnInit() {
    // Catálogo solo para mostrar nombres y fotos en el detalle.
    this.prodSrv.Listar().subscribe({ next: (l) => this.productos.set(l), error: () => { /* el detalle usa "Producto #id" */ } });

    // Consulta inmediata y luego cada 10 s. Si una consulta falla, el temporizador sigue.
    timer(0, 10000).pipe(
      switchMap(() => this.pedSrv.MisPedidos().pipe(
        switchMap((lista) => {
          const conf = lista.filter((p) => this.confirmado(p));
          if (!conf.length) return of({ lista, mapa: {} as Record<number, Delivery | null> });
          return forkJoin(conf.map((p) => this.delSrv.PorPedido(p.id).pipe(catchError(() => of(null))))).pipe(
            map((ds) => {
              const mapa: Record<number, Delivery | null> = {};
              conf.forEach((p, i) => (mapa[p.id] = ds[i]));
              return { lista, mapa };
            })
          );
        }),
        catchError((e) => { this.cargando.set(false); this.error.set(mensajeError(e)); return EMPTY; })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ lista, mapa }) => {
      this.pedidos.set([...lista].sort((a, b) => b.id - a.id));
      this.entregas.set(mapa);
      this.error.set('');
      this.cargando.set(false);
      this.actualizado.set(new Date());
    });
  }

  private confirmado(p: Pedido) { return (p.estado ?? '').toUpperCase() === 'CONFIRMADO'; }
  entrega(p: Pedido) { return this.entregas()[p.id] ?? null; }

  // Índice del último paso cumplido (0..4).
  avance(p: Pedido): number {
    if (!this.confirmado(p)) return 0;
    switch ((this.entrega(p)?.estado ?? '').toUpperCase()) {
      case 'ENTREGADO': return 4;
      case 'EN_CAMINO': return 3;
      case 'ASIGNADO': return 2;
      default: return 1;
    }
  }

  lineas(p: Pedido): DetallePedido[] { return p.detalle ?? p.detalles ?? p.items ?? []; }
  producto(id: number) { return this.productos().find((x) => x.id === id) ?? null; }
  nombre(d: DetallePedido) { return this.producto(d.productoId)?.nombre ?? d.nombreProducto ?? 'Producto #' + d.productoId; }
}
