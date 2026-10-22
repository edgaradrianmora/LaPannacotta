import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../services/delivery.service';
import { Delivery } from '../../core/models';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-delivery',
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Delivery</h1>
        <p>Asignar un repartidor y marcas el avance</p>
      </div>
      <button class="btn" (click)="nuevo()">Crear entrega manual</button>
    </div>

    @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }
    @if (ok()) { <div class="alerta alerta-ok">{{ ok() }}</div> }

    @if (mostrarForm()) {
      <div class="tarjeta">
        <h2 style="margin-bottom:16px">{{ editandoId() ? 'Actualizar entrega #' + editandoId() : 'Nueva entrega' }}</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="rejilla">
            @if (!editandoId()) {
              <div class="campo">
                <label for="pi">ID del pedido</label>
                <input id="pi" type="number" formControlName="pedidoId" [class.invalido]="inv('pedidoId')" />
                @if (inv('pedidoId')) { <span class="msg-error">Indica el ID del pedido.</span> }
              </div>
              <div class="campo">
                <label for="cn">Cliente</label>
                <input id="cn" formControlName="clienteNombre" [class.invalido]="inv('clienteNombre')" />
                @if (inv('clienteNombre')) { <span class="msg-error">El cliente es obligatorio.</span> }
              </div>
              <div class="campo">
                <label for="di">Dirección</label>
                <input id="di" formControlName="direccion" [class.invalido]="inv('direccion')" />
                @if (inv('direccion')) { <span class="msg-error">La dirección es obligatoria.</span> }
              </div>
            }
            <div class="campo">
              <label for="re">Repartidor</label>
              <input id="re" formControlName="repartidor" [class.invalido]="inv('repartidor')" />
              @if (inv('repartidor')) { <span class="msg-error">Indica el repartidor.</span> }
            </div>
            <div class="campo">
              <label for="es">Estado</label>
              <select id="es" formControlName="estado">
                @for (e of estados; track e) { <option [value]="e">{{ e }}</option> }
              </select>
            </div>
          </div>
          <div class="acciones" style="margin-top:16px">
            <button class="btn" type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : 'Guardar' }}</button>
            <button class="btn btn-borde" type="button" (click)="mostrarForm.set(false)">Cancelar</button>
          </div>
        </form>
      </div>
    }

    <div class="tarjeta tabla-scroll">
      <table>
        <thead>
          <tr><th>ID</th><th>Pedido</th><th>Cliente</th><th>Dirección</th><th>Repartidor</th><th>Asignación</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          @for (d of entregas(); track d.id) {
            <tr>
              <td>{{ d.id }}</td>
              <td>#{{ d.pedidoId }}</td>
              <td>{{ d.clienteNombre }}</td>
              <td>{{ d.direccion }}</td>
              <td>{{ d.repartidor || 'Sin asignar' }}</td>
              <td>{{ d.fechaAsignacion ? (d.fechaAsignacion | date: 'dd/MM/yyyy HH:mm') : '—' }}</td>
              <td><span class="etiqueta" [class.etiqueta-ok]="esEntregado(d)" [class.etiqueta-aviso]="!esEntregado(d)">{{ d.estado }}</span></td>
              <td><div class="acciones">
                <button class="btn btn-borde btn-chico" (click)="verUno(d)">Ver</button>
                <button class="btn btn-borde btn-chico" (click)="editar(d)">Asignar / Estado</button>
                <button class="btn btn-peligro btn-chico" (click)="eliminar(d)">Eliminar</button>
              </div></td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vacio">{{ cargando() ? 'Cargando…' : 'No hay entregas. Confirma un pedido para generar una.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DeliveryPage implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(DeliveryService);

  estados = ['PENDIENTE', 'ASIGNADO', 'EN_CAMINO', 'ENTREGADO'];

  entregas = signal<Delivery[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mostrarForm = signal(false);
  editandoId = signal<number | null>(null);
  error = signal('');
  ok = signal('');

  form = this.fb.nonNullable.group({
    pedidoId: [0, [Validators.required, Validators.min(1)]],
    clienteNombre: ['', Validators.required],
    direccion: ['', Validators.required],
    repartidor: [''],
    estado: ['PENDIENTE', Validators.required]
  });

  ngOnInit() { this.cargar(); }

  inv(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  esEntregado(d: Delivery) { return (d.estado ?? '').toUpperCase() === 'ENTREGADO'; }

  cargar() {
    this.cargando.set(true);
    this.srv.Listar().subscribe({
      next: (l) => { this.entregas.set(l); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  nuevo() {
    this.limpiar();
    this.editandoId.set(null);
    this.form.reset({ pedidoId: 0, clienteNombre: '', direccion: '', repartidor: '', estado: 'PENDIENTE' });
    this.activarCamposCreacion(true);
    this.mostrarForm.set(true);
  }

  editar(d: Delivery) {
    this.limpiar();
    this.editandoId.set(d.id ?? null);
    this.form.reset({
      pedidoId: d.pedidoId, clienteNombre: d.clienteNombre, direccion: d.direccion,
      repartidor: d.repartidor ?? '', estado: d.estado
    });
    this.activarCamposCreacion(false);
    this.mostrarForm.set(true);
  }

  private activarCamposCreacion(activo: boolean) {
    for (const c of ['pedidoId', 'clienteNombre', 'direccion']) {
      activo ? this.form.get(c)?.enable() : this.form.get(c)?.disable();
    }
    if (!activo) this.form.get('repartidor')?.addValidators(Validators.required);
    else this.form.get('repartidor')?.removeValidators(Validators.required);
    this.form.get('repartidor')?.updateValueAndValidity();
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.limpiar();
    this.guardando.set(true);
    const id = this.editandoId();
    const v = this.form.getRawValue();
    const peticion = id
      ? this.srv.Actualizar(id, { repartidor: v.repartidor, estado: v.estado })
      : this.srv.Registrar(v as Delivery);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.ok.set(id ? 'Entrega actualizada.' : 'Entrega creada.');
        this.cargar();
      },
      error: (e) => { this.guardando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  verUno(d: Delivery) {
    if (!d.id) return;
    this.srv.Obtener(d.id).subscribe({
      next: (x) => this.ok.set(`Entrega #${x.id} — pedido #${x.pedidoId}, ${x.clienteNombre}, estado ${x.estado}, repartidor ${x.repartidor || 'sin asignar'}.`),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  eliminar(d: Delivery) {
    if (!d.id || !confirm(`¿Eliminar la entrega #${d.id}?`)) return;
    this.limpiar();
    this.srv.Eliminar(d.id).subscribe({
      next: () => { this.ok.set('Entrega eliminada.'); this.cargar(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  private limpiar() { this.error.set(''); this.ok.set(''); }
}
