import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery, Pedido, Producto } from '../../core/models';
import { Foto } from '../../shared/foto';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, CurrencyPipe, Foto],
  template: `
    <section class="saludo">
      <h1>Hola, {{ auth.usuario()?.username }}</h1>
      <p>{{ hoy }}</p>
    </section>

    @if (cargando()) {
      <p class="vacio">Cargando el resumen…</p>
    } @else {
      <section class="resumen">
        <a class="dato" routerLink="/productos">
          <strong>{{ productos().length }}</strong>
          <span>productos en la vitrina</span>
        </a>
        <a class="dato" [class.alerta]="pocoStock().length > 0" routerLink="/productos">
          <strong>{{ pocoStock().length }}</strong>
          <span>con 5 unidades o menos</span>
        </a>
        <a class="dato" routerLink="/pedidos">
          <strong>{{ porConfirmar().length }}</strong>
          <span>pedidos por confirmar</span>
        </a>
        <a class="dato" routerLink="/delivery">
          <strong>{{ enCurso().length }}</strong>
          <span>entregas por completar</span>
        </a>
      </section>

      <div class="dos">
        <section class="tarjeta">
          <div class="titulo-bloque"><h2>Pedidos por confirmar</h2><a routerLink="/pedidos">Ver todos</a></div>
          @for (p of porConfirmar().slice(0, 5); track p.id) {
            <div class="linea">
              <div><strong>#{{ p.id }} · {{ p.clienteNombre }}</strong><small>{{ p.direccionEntrega }}</small></div>
              <span>{{ p.total | currency: 'S/ ' }}</span>
            </div>
          } @empty {
            <p class="vacio">No hay pedidos esperando confirmación.</p>
          }
        </section>

        <section class="tarjeta">
          <div class="titulo-bloque"><h2>Para reponer pronto</h2><a routerLink="/productos">Ver vitrina</a></div>
          @for (p of pocoStock().slice(0, 5); track p.id) {
            <div class="linea">
              <div class="con-foto">
                <span class="mini"><app-foto [nombre]="p.nombre" [imagen]="p.imagenUrl" /></span>
                <div><strong>{{ p.nombre }}</strong><small>{{ p.categoria }}</small></div>
              </div>
              <span class="etiqueta" [class.etiqueta-mal]="p.stock <= 0" [class.etiqueta-aviso]="p.stock > 0">{{ p.stock }} u.</span>
            </div>
          } @empty {
            <p class="vacio">Todo con buen stock.</p>
          }
        </section>
      </div>

      <section class="atajos">
        <a class="btn" routerLink="/pedidos">Registrar un pedido</a>
        <a class="btn btn-borde" routerLink="/productos">Agregar un producto</a>
      </section>
    }
  `,
  styles: `
    .saludo { margin-bottom: 28px; }
    .saludo p { color: var(--suave); margin-top: 6px; }
    .resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 26px; }
    .dato { display: flex; flex-direction: column; gap: 2px; padding: 20px 22px; background: var(--papel); border: 1px solid var(--borde); border-radius: 20px; text-decoration: none; color: var(--tinta); transition: border-color .15s; }
    .dato:hover { border-color: var(--frambuesa); }
    .dato strong { font-family: var(--serif); font-weight: 400; font-size: 2.2rem; line-height: 1; }
    .dato span { color: var(--suave); font-size: .92rem; }
    .dato.alerta { background: var(--mantequilla); border-color: transparent; }
    .dato.alerta span { color: var(--mantequilla-osc); }
    .dos { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    .titulo-bloque { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .titulo-bloque a { color: var(--frambuesa); font-weight: 600; font-size: .9rem; }
    .linea { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--borde); }
    .linea:last-child { border-bottom: 0; }
    .linea small { display: block; color: var(--suave); }
    .con-foto { display: flex; align-items: center; gap: 12px; }
    .mini { width: 44px; height: 44px; border-radius: 12px; overflow: hidden; flex: none; font-size: .5rem; }
    .atajos { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
    .atajos a { text-decoration: none; display: inline-block; }
    @media (max-width: 800px) { .dos { grid-template-columns: 1fr; } }
  `
})
export class Inicio implements OnInit {
  protected auth = inject(AuthService);
  private prod = inject(ProductoService);
  private ped = inject(PedidoService);
  private del = inject(DeliveryService);

  productos = signal<Producto[]>([]);
  pedidos = signal<Pedido[]>([]);
  entregas = signal<Delivery[]>([]);
  cargando = signal(true);

  hoy = (() => { const t = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1); })();

  pocoStock = computed(() => this.productos().filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock));
  porConfirmar = computed(() => this.pedidos().filter((p) => (p.estado ?? '').toUpperCase() !== 'CONFIRMADO'));
  enCurso = computed(() => this.entregas().filter((d) => (d.estado ?? '').toUpperCase() !== 'ENTREGADO'));

  ngOnInit() {
    forkJoin({
      productos: this.prod.Listar().pipe(catchError(() => of([] as Producto[]))),
      pedidos: this.ped.Listar().pipe(catchError(() => of([] as Pedido[]))),
      entregas: this.del.Listar().pipe(catchError(() => of([] as Delivery[])))
    }).subscribe((r) => {
      this.productos.set(r.productos);
      this.pedidos.set(r.pedidos);
      this.entregas.set(r.entregas);
      this.cargando.set(false);
    });
  }
}
