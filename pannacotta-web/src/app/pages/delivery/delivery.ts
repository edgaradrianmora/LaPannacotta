import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DeliveryService } from '../../services/delivery.service';
import { RepartidorService } from '../../services/repartidor.service';
import { Delivery, Repartidor } from '../../core/models';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-delivery',
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Delivery</h1>
        <p>Asignar un repartidor y marcar el avance</p>
      </div>

      <button class="btn" (click)="nuevo()">
        Crear entrega manual
      </button>
    </div>

    @if (error()) {
      <div class="alerta alerta-error">
        {{ error() }}
      </div>
    }

    @if (ok()) {
      <div class="alerta alerta-ok">
        {{ ok() }}
      </div>
    }

    @if (mostrarForm()) {
      <div class="tarjeta">
        <h2 style="margin-bottom:16px">
          {{
            editandoId()
              ? 'Actualizar entrega #' + editandoId()
              : 'Nueva entrega'
          }}
        </h2>

        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="rejilla">

            @if (!editandoId()) {
              <div class="campo">
                <label for="pi">ID del pedido</label>

                <input
                  id="pi"
                  type="number"
                  formControlName="pedidoId"
                  [class.invalido]="inv('pedidoId')"
                />

                @if (inv('pedidoId')) {
                  <span class="msg-error">
                    Indica el ID del pedido.
                  </span>
                }
              </div>

              <div class="campo">
                <label for="cn">Cliente</label>

                <input
                  id="cn"
                  formControlName="clienteNombre"
                  [class.invalido]="inv('clienteNombre')"
                />

                @if (inv('clienteNombre')) {
                  <span class="msg-error">
                    El cliente es obligatorio.
                  </span>
                }
              </div>

              <div class="campo">
                <label for="di">Dirección</label>

                <input
                  id="di"
                  formControlName="direccion"
                  [class.invalido]="inv('direccion')"
                />

                @if (inv('direccion')) {
                  <span class="msg-error">
                    La dirección es obligatoria.
                  </span>
                }
              </div>
            }

            @if (editandoId()) {
              <div class="campo">
                <label for="re">Repartidor</label>

                <select
                  id="re"
                  formControlName="repartidorId"
                  [class.invalido]="inv('repartidorId')"
                >
                  <option [ngValue]="0">
                    Seleccione un repartidor
                  </option>

                  @for (r of repartidores(); track r.id) {
                    <option [ngValue]="r.id">
                      {{ r.nombre }}
                      {{ r.telefono ? ' - ' + r.telefono : '' }}
                    </option>
                  }
                </select>

                @if (inv('repartidorId')) {
                  <span class="msg-error">
                    Selecciona un repartidor.
                  </span>
                }

                @if (repartidores().length === 0) {
                  <span class="msg-error">
                    No hay repartidores activos registrados.
                  </span>
                }
              </div>
            }

            <div class="campo">
              <label for="es">Estado</label>

              <select
                id="es"
                formControlName="estado"
              >
                @for (e of estados; track e) {
                  <option [value]="e">
                    {{ e }}
                  </option>
                }
              </select>
            </div>
          </div>

          <div
            class="acciones"
            style="margin-top:16px"
          >
            <button
              class="btn"
              type="submit"
              [disabled]="guardando()"
            >
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>

            <button
              class="btn btn-borde"
              type="button"
              (click)="mostrarForm.set(false)"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    }

    <div class="tarjeta tabla-scroll">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Dirección</th>
            <th>Repartidor</th>
            <th>Asignación</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          @for (d of entregas(); track d.id) {
            <tr>
              <td>
                {{ d.id }}
              </td>

              <td>
                #{{ d.pedidoId }}
              </td>

              <td>
                {{ d.clienteNombre }}
              </td>

              <td>
                {{ d.direccion }}
              </td>

              <td>
                {{ d.repartidor || 'Sin asignar' }}
              </td>

              <td>
                {{
                  d.fechaAsignacion
                    ? (d.fechaAsignacion | date: 'dd/MM/yyyy HH:mm')
                    : '—'
                }}
              </td>

              <td>
                <span
                  class="etiqueta"
                  [class.etiqueta-ok]="esEntregado(d)"
                  [class.etiqueta-aviso]="!esEntregado(d)"
                >
                  {{ d.estado }}
                </span>
              </td>

              <td>
                <div class="acciones">
                  <button
                    class="btn btn-borde btn-chico"
                    (click)="verUno(d)"
                  >
                    Ver
                  </button>

                  <button
                    class="btn btn-borde btn-chico"
                    (click)="editar(d)"
                  >
                    Asignar / Estado
                  </button>

                  <button
                    class="btn btn-peligro btn-chico"
                    (click)="eliminar(d)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td
                colspan="8"
                class="vacio"
              >
                {{
                  cargando()
                    ? 'Cargando...'
                    : 'No hay entregas. Confirma un pedido para generar una.'
                }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DeliveryPage implements OnInit {

  private fb = inject(FormBuilder);
  private srv = inject(DeliveryService);
  private repartidorSrv = inject(RepartidorService);

  estados = [
    'PENDIENTE',
    'ASIGNADO',
    'EN_CAMINO',
    'ENTREGADO'
  ];

  entregas = signal<Delivery[]>([]);
  repartidores = signal<Repartidor[]>([]);

  cargando = signal(false);
  guardando = signal(false);
  mostrarForm = signal(false);
  editandoId = signal<number | null>(null);

  error = signal('');
  ok = signal('');

  form = this.fb.nonNullable.group({
    pedidoId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    clienteNombre: [
      '',
      Validators.required
    ],
    direccion: [
      '',
      Validators.required
    ],
    repartidorId: [
      0
    ],
    estado: [
      'PENDIENTE',
      Validators.required
    ]
  });

  ngOnInit() {
    this.cargar();
    this.cargarRepartidores();
  }

  inv(campo: string) {
    const control = this.form.get(campo);

    return !!control
      && control.invalid
      && control.touched;
  }

  esEntregado(d: Delivery) {
    return (d.estado ?? '').toUpperCase() === 'ENTREGADO';
  }

  cargar() {
    this.cargando.set(true);

    this.srv.Listar().subscribe({
      next: (lista) => {
        this.entregas.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(mensajeError(e));
      }
    });
  }

  cargarRepartidores() {
    this.repartidorSrv.ListarActivos().subscribe({
      next: (lista) => {
        this.repartidores.set(lista);
      },
      error: (e) => {
        this.error.set(mensajeError(e));
      }
    });
  }

  nuevo() {
    this.limpiar();

    this.editandoId.set(null);

    this.form.reset({
      pedidoId: 0,
      clienteNombre: '',
      direccion: '',
      repartidorId: 0,
      estado: 'PENDIENTE'
    });

    this.activarCamposCreacion(true);

    this.mostrarForm.set(true);
  }

  editar(d: Delivery) {
    this.limpiar();

    this.editandoId.set(d.id ?? null);

    const repartidorPorNombre =
      this.repartidores().find(
        (r) =>
          r.nombre.trim().toLowerCase()
          === (d.repartidor ?? '').trim().toLowerCase()
      );

    const repartidorId =
      d.repartidorId
      ?? repartidorPorNombre?.id
      ?? 0;

    this.form.reset({
      pedidoId: d.pedidoId,
      clienteNombre: d.clienteNombre,
      direccion: d.direccion,
      repartidorId: repartidorId,
      estado: d.estado
    });

    this.activarCamposCreacion(false);

    this.mostrarForm.set(true);
  }

  private activarCamposCreacion(activo: boolean) {

    for (const campo of [
      'pedidoId',
      'clienteNombre',
      'direccion'
    ]) {
      if (activo) {
        this.form.get(campo)?.enable();
      } else {
        this.form.get(campo)?.disable();
      }
    }

    const repartidorControl =
      this.form.get('repartidorId');

    repartidorControl?.clearValidators();

    if (!activo) {
      repartidorControl?.setValidators([
        Validators.required,
        Validators.min(1)
      ]);
    }

    repartidorControl?.updateValueAndValidity();
  }

  guardar() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.limpiar();
    this.guardando.set(true);

    const id = this.editandoId();
    const valores = this.form.getRawValue();

    if (id) {

      this.srv.Actualizar(
        id,
        {
          repartidorId:
            valores.repartidorId > 0
              ? valores.repartidorId
              : undefined,
          estado: valores.estado
        }
      ).subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarForm.set(false);
          this.ok.set('Entrega actualizada.');
          this.cargar();
        },
        error: (e) => {
          this.guardando.set(false);
          this.error.set(mensajeError(e));
        }
      });

      return;
    }

    const nuevaEntrega: Delivery = {
      pedidoId: valores.pedidoId,
      clienteNombre: valores.clienteNombre,
      direccion: valores.direccion,
      estado: 'PENDIENTE'
    };

    this.srv.Registrar(nuevaEntrega).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.ok.set('Entrega creada.');
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(mensajeError(e));
      }
    });
  }

  verUno(d: Delivery) {

    if (!d.id) {
      return;
    }

    this.srv.Obtener(d.id).subscribe({
      next: (x) => {
        this.ok.set(
          `Entrega #${x.id} — pedido #${x.pedidoId}, `
          + `${x.clienteNombre}, estado ${x.estado}, `
          + `repartidor ${x.repartidor || 'sin asignar'}.`
        );
      },
      error: (e) => {
        this.error.set(mensajeError(e));
      }
    });
  }

  eliminar(d: Delivery) {

    if (
      !d.id
      || !confirm(`¿Eliminar la entrega #${d.id}?`)
    ) {
      return;
    }

    this.limpiar();

    this.srv.Eliminar(d.id).subscribe({
      next: () => {
        this.ok.set('Entrega eliminada.');
        this.cargar();
      },
      error: (e) => {
        this.error.set(mensajeError(e));
      }
    });
  }

  private limpiar() {
    this.error.set('');
    this.ok.set('');
  }
}