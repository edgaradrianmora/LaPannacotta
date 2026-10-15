import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidoService } from '../../services/pedido.service';
import { ProductoService } from '../../services/producto.service';
import { DetallePedido, Pedido, Producto } from '../../core/models';
import { mensajeError } from '../../core/errores';
import { Foto } from '../../shared/foto';

@Component({
  selector: 'app-pedidos',
  imports: [ReactiveFormsModule, CurrencyPipe, Foto],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Pedidos</h1>
        <p>Registra el pedido, confírmalo para descontar stock y se genera la entrega automáticamente.</p>
      </div>
      <button class="btn" (click)="nuevo()">Registrar pedido</button>
    </div>

    @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }
    @if (ok()) { <div class="alerta alerta-ok">{{ ok() }}</div> }

    @if (mostrarForm()) {
      <div class="tarjeta">
        <h2 style="margin-bottom:16px">Nuevo pedido</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="rejilla">
            <div class="campo">
              <label for="cn">Cliente</label>
              <input id="cn" formControlName="clienteNombre" [class.invalido]="inv('clienteNombre')" />
              @if (inv('clienteNombre')) { <span class="msg-error">El nombre es obligatorio.</span> }
            </div>
            <div class="campo">
              <label for="ct">Teléfono (9 dígitos)</label>
              <input id="ct" formControlName="clienteTelefono" maxlength="9" [class.invalido]="inv('clienteTelefono')" />
              @if (inv('clienteTelefono')) { <span class="msg-error">Debe tener 9 dígitos.</span> }
            </div>
            <div class="campo">
              <label for="de">Dirección de entrega</label>
              <input id="de" formControlName="direccionEntrega" [class.invalido]="inv('direccionEntrega')" />
              @if (inv('direccionEntrega')) { <span class="msg-error">La dirección es obligatoria.</span> }
            </div>
          </div>

          <h3 style="margin:22px 0 12px">Productos del pedido</h3>
          <div formArrayName="items">
            @for (fila of items.controls; track $index; let i = $index) {
              <div class="fila-item" [formGroupName]="i">
                <span class="mini">
                  @if (prod(fila.get('productoId')?.value); as pr) { <app-foto [nombre]="pr.nombre" [imagen]="pr.imagenUrl" /> }
                </span>
                <div class="campo">
                  <label>Producto</label>
                  <select formControlName="productoId" [class.invalido]="fila.get('productoId')?.invalid && fila.get('productoId')?.touched">
                    <option [ngValue]="null" disabled>Elige un producto…</option>
                    @for (p of productos(); track p.id) {
                      <option [ngValue]="p.id">{{ p.nombre }} — S/ {{ p.precio }} (stock {{ p.stock }})</option>
                    }
                  </select>
                </div>
                <div class="campo">
                  <label>Cantidad</label>
                  <input type="number" formControlName="cantidad" [class.invalido]="fila.get('cantidad')?.invalid && fila.get('cantidad')?.touched" />
                </div>
                <div class="campo" style="justify-content:flex-end">
                  <button class="btn btn-peligro btn-chico" type="button" (click)="quitarItem(i)" [disabled]="items.length === 1">Quitar</button>
                </div>
              </div>
            }
          </div>
          <button class="btn btn-borde btn-chico" type="button" (click)="agregarItem()">+ Agregar otro producto</button>

          <div class="acciones" style="margin-top:18px">
            <button class="btn" type="submit" [disabled]="guardando()">{{ guardando() ? 'Registrando…' : 'Registrar pedido' }}</button>
            <button class="btn btn-borde" type="button" (click)="mostrarForm.set(false)">Cancelar</button>
          </div>
        </form>
      </div>
    }

    <div class="tarjeta tabla-scroll">
      <table>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Dirección</th><th>Total</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          @for (p of pedidos(); track p.id) {
            <tr>
              <td>{{ p.id }}</td>
              <td><strong>{{ p.clienteNombre }}</strong><br /><small>{{ p.clienteTelefono }}</small></td>
              <td>{{ p.direccionEntrega }}</td>
              <td>{{ p.total | currency: 'S/ ' }}</td>
              <td><span class="etiqueta" [class.etiqueta-ok]="esConfirmado(p)" [class.etiqueta-aviso]="!esConfirmado(p)">{{ p.estado ?? '—' }}</span></td>
              <td><div class="acciones">
                <button class="btn btn-borde btn-chico" (click)="verDetalle(p)">{{ detalle()?.id === p.id ? 'Ocultar' : 'Detalle' }}</button>
                <button class="btn btn-ok btn-chico" (click)="confirmar(p)" [disabled]="esConfirmado(p)">Confirmar</button>
                <button class="btn btn-peligro btn-chico" (click)="eliminar(p)">Eliminar</button>
              </div></td>
            </tr>
            @if (detalle()?.id === p.id) {
              <tr>
                <td colspan="6" class="detalle">
                  <strong>Detalle del pedido #{{ p.id }}</strong>
                  <ul>
                    @for (d of lineas(detalle()!); track $index) {
                      <li>{{ d.cantidad }} × {{ d.nombreProducto ?? d.productoNombre ?? 'Producto #' + d.productoId }}
                        @if (d.subtotal != null) { — {{ d.subtotal | currency: 'S/ ' }} }
                      </li>
                    } @empty { <li>Sin líneas de detalle.</li> }
                  </ul>
                </td>
              </tr>
            }
          } @empty {
            <tr><td colspan="6" class="vacio">{{ cargando() ? 'Cargando…' : 'No hay pedidos todavía.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    .fila-item { display: grid; grid-template-columns: 56px 2fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 12px; }
    .mini { width: 56px; height: 56px; border-radius: 14px; overflow: hidden; background: var(--leche); font-size: .6rem; }
    @media (max-width: 700px) { .fila-item { grid-template-columns: 48px 1fr; } }
    .detalle { background: var(--leche); }
    .detalle ul { margin: 6px 0 0; padding-left: 20px; }
  `
})
export class Pedidos implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(PedidoService);
  private prodSrv = inject(ProductoService);

  pedidos = signal<Pedido[]>([]);
  productos = signal<Producto[]>([]);
  detalle = signal<Pedido | null>(null);
  cargando = signal(false);
  guardando = signal(false);
  mostrarForm = signal(false);
  error = signal('');
  ok = signal('');

  form = this.fb.nonNullable.group({
    clienteNombre: ['', Validators.required],
    clienteTelefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    direccionEntrega: ['', Validators.required],
    items: this.fb.array([this.nuevaFila()])
  });

  get items() { return this.form.controls.items as FormArray; }

  ngOnInit() { this.cargar(); }

  private nuevaFila() {
    return this.fb.group({
      productoId: this.fb.control<number | null>(null, Validators.required),
      cantidad: this.fb.control(1, [Validators.required, Validators.min(1)])
    });
  }

  inv(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  prod(id: unknown) { return this.productos().find((x) => x.id === id) ?? null; }
  esConfirmado(p: Pedido) { return (p.estado ?? '').toUpperCase() === 'CONFIRMADO'; }
  lineas(p: Pedido): DetallePedido[] { return p.detalles ?? p.items ?? []; }

  cargar() {
    this.cargando.set(true);
    this.srv.Listar().subscribe({
      next: (l) => { this.pedidos.set(l); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  nuevo() {
    this.limpiar();
    this.form.reset({ clienteNombre: '', clienteTelefono: '', direccionEntrega: '' });
    this.items.clear();
    this.items.push(this.nuevaFila());
    // Se recarga el catálogo para ver el stock actual.
    this.prodSrv.Listar().subscribe({
      next: (l) => this.productos.set(l),
      error: (e) => this.error.set(mensajeError(e))
    });
    this.mostrarForm.set(true);
  }

  agregarItem() { this.items.push(this.nuevaFila()); }
  quitarItem(i: number) { if (this.items.length > 1) this.items.removeAt(i); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.limpiar();
    this.guardando.set(true);
    const v = this.form.getRawValue();
    this.srv.Registrar({
      clienteNombre: v.clienteNombre,
      clienteTelefono: v.clienteTelefono,
      direccionEntrega: v.direccionEntrega,
      items: v.items.map((x) => ({ productoId: x.productoId as number, cantidad: x.cantidad as number }))
    }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.ok.set('Pedido registrado. Confírmalo para descontar stock y generar el delivery.');
        this.cargar();
      },
      error: (e) => { this.guardando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  verDetalle(p: Pedido) {
    if (this.detalle()?.id === p.id) { this.detalle.set(null); return; }
    this.srv.Obtener(p.id).subscribe({
      next: (d) => this.detalle.set(d),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  confirmar(p: Pedido) {
    this.limpiar();
    this.srv.Confirmar(p.id).subscribe({
      next: () => { this.ok.set(`Pedido #${p.id} confirmado. Revisa la pestaña Delivery.`); this.cargar(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  eliminar(p: Pedido) {
    if (!confirm(`¿Eliminar el pedido #${p.id}?`)) return;
    this.limpiar();
    this.srv.Eliminar(p.id).subscribe({
      next: () => { this.ok.set('Pedido eliminado.'); this.detalle.set(null); this.cargar(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  private limpiar() { this.error.set(''); this.ok.set(''); }
}
