import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../core/models';
import { mensajeError } from '../../core/errores';
import { Foto } from '../../shared/foto';

@Component({
  selector: 'app-tienda',
  imports: [ReactiveFormsModule, CurrencyPipe, Foto],
  template: `
    <div class="pagina-titulo">
      <h1>Nuestra vitrina</h1>
      <p>Elige tus postres, indica a dónde llevarlos y sigue tu pedido paso a paso desde "Mis pedidos".</p>
    </div>

    @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }

    <div class="filtros">
      <input class="buscar" type="search" placeholder="Buscar un postre…" [value]="busqueda()" (input)="busqueda.set($any($event.target).value)" aria-label="Buscar producto" />
      <div class="chips">
        <button type="button" class="chip" [class.on]="categoria() === ''" (click)="categoria.set('')">Todos</button>
        @for (c of categorias(); track c) {
          <button type="button" class="chip" [class.on]="categoria() === c" (click)="categoria.set(c)">{{ c }}</button>
        }
      </div>
    </div>

    <div class="tienda">
      <section>
        @if (cargando()) {
          <p class="vacio">Cargando la vitrina…</p>
        } @else {
          <div class="vitrina">
            @for (p of filtrados(); track p.id) {
              <article class="pastel">
                <div class="foto">
                  <app-foto [nombre]="p.nombre" [imagen]="p.imagenUrl" />
                  <span class="precio">{{ p.precio | currency: 'S/ ' }}</span>
                </div>
                <div class="cuerpo">
                  <small class="cat">{{ p.categoria }}</small>
                  <h3>{{ p.nombre }}</h3>
                  <p class="desc">{{ p.descripcion || 'Hecho al momento.' }}</p>
                  <div class="pie">
                    <span class="etiqueta" [class.etiqueta-ok]="p.stock > 5" [class.etiqueta-aviso]="p.stock > 0 && p.stock <= 5" [class.etiqueta-mal]="p.stock <= 0">
                      {{ p.stock <= 0 ? 'Agotado' : p.stock + ' disponibles' }}
                    </span>
                    <button class="btn btn-chico" (click)="carrito.agregar(p)" [disabled]="p.stock <= 0 || carrito.enCarrito(p.id) >= p.stock">
                      {{ carrito.enCarrito(p.id) ? 'Agregar otro (' + carrito.enCarrito(p.id) + ')' : 'Agregar' }}
                    </button>
                  </div>
                </div>
              </article>
            } @empty {
              <p class="vacio">No hay postres que coincidan con tu búsqueda.</p>
            }
          </div>
        }
      </section>

      <aside class="carrito tarjeta" aria-label="Tu pedido">
        <h2>Tu pedido</h2>
        @if (carrito.items().length === 0) {
          <p class="vacio">Aún no agregas nada. Elige un postre de la vitrina.</p>
        } @else {
          <ul class="lineas">
            @for (l of carrito.items(); track l.producto.id) {
              <li>
                <span class="mini"><app-foto [nombre]="l.producto.nombre" [imagen]="l.producto.imagenUrl" /></span>
                <div class="info">
                  <strong>{{ l.producto.nombre }}</strong>
                  <small>{{ l.producto.precio | currency: 'S/ ' }} c/u</small>
                  <div class="cant">
                    <button type="button" aria-label="Quitar uno" (click)="carrito.cambiar(l.producto.id, -1)">−</button>
                    <span>{{ l.cantidad }}</span>
                    <button type="button" aria-label="Agregar uno" (click)="carrito.cambiar(l.producto.id, 1)" [disabled]="l.cantidad >= l.producto.stock">+</button>
                    <button type="button" class="quitar" (click)="carrito.quitar(l.producto.id)">Quitar</button>
                  </div>
                </div>
                <span class="sub">{{ l.producto.precio * l.cantidad | currency: 'S/ ' }}</span>
              </li>
            }
          </ul>
          <div class="total"><span>Total</span><strong>{{ carrito.total() | currency: 'S/ ' }}</strong></div>

<form [formGroup]="form" (ngSubmit)="pedir()">
            <div class="campo">
              <label for="cn">Tu nombre</label>
              <input id="cn" formControlName="clienteNombre" [class.invalido]="inv('clienteNombre')" />
              @if (inv('clienteNombre')) { <span class="msg-error">Escribe tu nombre.</span> }
            </div>
            <div class="campo">
              <label for="ct">Celular (9 dígitos)</label>
              <input id="ct" formControlName="clienteTelefono" maxlength="9" inputmode="numeric" [class.invalido]="inv('clienteTelefono')" />
              @if (inv('clienteTelefono')) { <span class="msg-error">Debe tener 9 dígitos.</span> }
            </div>
            <div class="campo">
              <label for="de">Dirección de entrega</label>
              <input id="de" formControlName="direccionEntrega" [class.invalido]="inv('direccionEntrega')" />
              @if (inv('direccionEntrega')) { <span class="msg-error">Indica dónde entregarlo.</span> }
            </div>
            <div class="campo">
            <label for="ce">Correo electrónico</label>
            <input id="ce" type="email" formControlName="correoCliente"
                  placeholder="para recibir notificaciones"
                  [class.invalido]="inv('correoCliente')" />
            @if (inv('correoCliente')) {
              <span class="msg-error">Ingresa un correo válido.</span>
            }
          </div>
            <button class="btn" type="submit" [disabled]="enviando()">{{ enviando() ? 'Enviando…' : 'Hacer pedido' }}</button>
          </form>
        }
      </aside>
    </div>
  `,
  styles: `
    .tienda { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
    @media (max-width: 980px) { .tienda { grid-template-columns: 1fr; } }
    .filtros { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 22px; }
    .buscar { max-width: 300px; border-radius: 999px; padding-left: 18px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { border: 1.5px solid var(--borde); background: var(--papel); color: var(--tinta); padding: 6px 15px; border-radius: 999px; font: inherit; font-size: .88rem; cursor: pointer; }
    .chip.on { background: var(--frambuesa); border-color: var(--frambuesa); color: #fff; }
    .vitrina { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
    .pastel { background: var(--papel); border: 1px solid var(--borde); border-radius: 22px; overflow: hidden; box-shadow: var(--sombra); display: flex; flex-direction: column; }
    .foto { position: relative; aspect-ratio: 4 / 3; background: var(--leche); }
    .precio { position: absolute; right: 10px; bottom: 10px; background: var(--papel); color: var(--frambuesa); font-weight: 700; padding: 4px 12px; border-radius: 999px; font-size: .9rem; box-shadow: var(--sombra); }
    .cuerpo { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .cat { color: var(--suave); text-transform: uppercase; letter-spacing: .06em; font-size: .7rem; }
    .cuerpo h3 { font-size: 1.1rem; }
    .desc { color: var(--suave); font-size: .88rem; margin: 2px 0 10px; flex: 1; }
    .pie { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
    .carrito { position: sticky; top: 90px; }
    .carrito h2 { margin-bottom: 14px; }
    .lineas { list-style: none; margin: 0 0 12px; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .lineas li { display: grid; grid-template-columns: 48px 1fr auto; gap: 10px; align-items: start; }
    .mini { width: 48px; height: 48px; border-radius: 12px; overflow: hidden; background: var(--leche); font-size: .55rem; }
    .info { display: flex; flex-direction: column; gap: 2px; font-size: .9rem; }
    .info small { color: var(--suave); }
    .cant { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .cant button { width: 26px; height: 26px; border-radius: 50%; border: 1.5px solid var(--borde); background: var(--papel); cursor: pointer; font-size: 1rem; line-height: 1; }
    .cant button:disabled { opacity: .4; cursor: not-allowed; }
    .cant .quitar { width: auto; border: 0; border-radius: 0; background: none; color: var(--peligro); font-size: .78rem; margin-left: 4px; }
    .sub { font-weight: 600; font-size: .9rem; }
    .total { display: flex; justify-content: space-between; padding: 12px 0; border-top: 1px dashed var(--borde); margin-bottom: 14px; font-size: 1.05rem; }
    form { display: flex; flex-direction: column; gap: 12px; }
  `
})
export class Tienda implements OnInit {
  private fb = inject(FormBuilder);
  private prodSrv = inject(ProductoService);
  private pedSrv = inject(PedidoService);
  private router = inject(Router);
  protected carrito = inject(CarritoService);

  productos = signal<Producto[]>([]);
  cargando = signal(false);
  enviando = signal(false);
  error = signal('');
  busqueda = signal('');
  categoria = signal('');

form = this.fb.nonNullable.group({
    clienteNombre: ['', Validators.required],
    clienteTelefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    direccionEntrega: ['', Validators.required],
    correoCliente: ['', [Validators.required, Validators.email]]

  });

  private activos = computed(() => this.productos().filter((p) => (p.estado ?? 'ACTIVO').toUpperCase() !== 'INACTIVO'));
  categorias = computed(() => [...new Set(this.activos().map((p) => p.categoria).filter(Boolean))].sort());
  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const c = this.categoria();
    return this.activos().filter((p) => (!c || p.categoria === c) && (!q || p.nombre.toLowerCase().includes(q)));
  });

  ngOnInit() {
    this.carrito.recargar();
    this.cargando.set(true);
    this.prodSrv.Listar().subscribe({
      next: (l) => { this.productos.set(l); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  inv(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

pedir() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error.set('');
    this.enviando.set(true);
    const v = this.form.getRawValue();
    this.pedSrv.Registrar({
      clienteNombre:    v.clienteNombre,
      clienteTelefono:  v.clienteTelefono,
      direccionEntrega: v.direccionEntrega,
      correoCliente:    v.correoCliente,
      items: this.carrito.items().map((l) => ({
        productoId: l.producto.id as number,
        cantidad: l.cantidad
      }))
    }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.carrito.vaciar();
        this.router.navigate(['/mis-pedidos']);
      },
      error: (e) => { this.enviando.set(false); this.error.set(mensajeError(e)); }
    });
}
}
