import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RepartidorService } from '../../services/repartidor.service';
import { Repartidor } from '../../core/models';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-repartidores',
  imports: [ReactiveFormsModule],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Repartidores</h1>
        <p>Administración de repartidores para el servicio de delivery</p>
      </div>

      <button
        class="btn"
        type="button"
        (click)="nuevo()"
      >
        Nuevo repartidor
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
              ? 'Editar repartidor #' + editandoId()
              : 'Registrar repartidor'
          }}
        </h2>

        <form
          [formGroup]="form"
          (ngSubmit)="guardar()"
        >
          <div class="rejilla">

            <div class="campo">
              <label for="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                formControlName="nombre"
                [class.invalido]="inv('nombre')"
              />

              @if (inv('nombre')) {
                <span class="msg-error">
                  El nombre del repartidor es obligatorio.
                </span>
              }
            </div>

            <div class="campo">
              <label for="telefono">
                Teléfono
              </label>

              <input
                id="telefono"
                type="text"
                formControlName="telefono"
                maxlength="20"
              />
            </div>

            @if (editandoId()) {
              <div class="campo">
                <label for="estado">
                  Estado
                </label>

                <select
                  id="estado"
                  formControlName="estado"
                >
                  <option value="ACTIVO">
                    ACTIVO
                  </option>

                  <option value="INACTIVO">
                    INACTIVO
                  </option>
                </select>
              </div>
            }

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
              {{
                guardando()
                  ? 'Guardando...'
                  : 'Guardar'
              }}
            </button>

            <button
              class="btn btn-borde"
              type="button"
              (click)="cancelar()"
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
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          @for (r of repartidores(); track r.id) {
            <tr>
              <td>
                {{ r.id }}
              </td>

              <td>
                {{ r.nombre }}
              </td>

              <td>
                {{ r.telefono || '—' }}
              </td>

              <td>
                <span
                  class="etiqueta"
                  [class.etiqueta-ok]="esActivo(r)"
                  [class.etiqueta-aviso]="!esActivo(r)"
                >
                  {{ r.estado }}
                </span>
              </td>

              <td>
                <div class="acciones">

                  <button
                    class="btn btn-borde btn-chico"
                    type="button"
                    (click)="editar(r)"
                  >
                    Editar
                  </button>

                  @if (esActivo(r)) {
                    <button
                      class="btn btn-peligro btn-chico"
                      type="button"
                      (click)="desactivar(r)"
                    >
                      Desactivar
                    </button>
                  } @else {
                    <button
                      class="btn btn-borde btn-chico"
                      type="button"
                      (click)="activar(r)"
                    >
                      Activar
                    </button>
                  }

                </div>
              </td>
            </tr>
          } @empty {
            <tr>
              <td
                colspan="5"
                class="vacio"
              >
                {{
                  cargando()
                    ? 'Cargando...'
                    : 'No hay repartidores registrados.'
                }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class RepartidoresPage implements OnInit {

  private fb = inject(FormBuilder);
  private srv = inject(RepartidorService);

  repartidores = signal<Repartidor[]>([]);

  cargando = signal(false);
  guardando = signal(false);
  mostrarForm = signal(false);

  editandoId = signal<number | null>(null);

  error = signal('');
  ok = signal('');

  form = this.fb.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required
      ]
    ],
    telefono: [
      ''
    ],
    estado: [
      'ACTIVO',
      Validators.required
    ]
  });

  ngOnInit() {
    this.cargar();
  }

  inv(campo: string) {
    const control = this.form.get(campo);

    return !!control
      && control.invalid
      && control.touched;
  }

  esActivo(repartidor: Repartidor) {
    return repartidor.estado?.toUpperCase() === 'ACTIVO';
  }

  cargar() {
    this.cargando.set(true);

    this.srv.Listar().subscribe({
      next: (lista) => {
        this.repartidores.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(mensajeError(e));
      }
    });
  }

  nuevo() {
    this.limpiar();

    this.editandoId.set(null);

    this.form.reset({
      nombre: '',
      telefono: '',
      estado: 'ACTIVO'
    });

    this.mostrarForm.set(true);
  }

  editar(repartidor: Repartidor) {
    this.limpiar();

    this.editandoId.set(
      repartidor.id ?? null
    );

    this.form.reset({
      nombre: repartidor.nombre ?? '',
      telefono: repartidor.telefono ?? '',
      estado: repartidor.estado ?? 'ACTIVO'
    });

    this.mostrarForm.set(true);
  }

  cancelar() {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
    this.limpiar();
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

    const repartidor: Repartidor = {
      nombre: valores.nombre.trim(),
      telefono: valores.telefono.trim(),
      estado: valores.estado
    };

    if (id) {

      this.srv.Actualizar(
        id,
        repartidor
      ).subscribe({
        next: () => {
          this.guardando.set(false);
          this.mostrarForm.set(false);
          this.editandoId.set(null);

          this.ok.set(
            'Repartidor actualizado correctamente.'
          );

          this.cargar();
        },
        error: (e) => {
          this.guardando.set(false);
          this.error.set(mensajeError(e));
        }
      });

      return;
    }

    this.srv.Registrar(
      repartidor
    ).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);

        this.ok.set(
          'Repartidor registrado correctamente.'
        );

        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(mensajeError(e));
      }
    });
  }

  desactivar(repartidor: Repartidor) {

    if (!repartidor.id) {
      return;
    }

    if (
      !confirm(
        `¿Desactivar al repartidor ${repartidor.nombre}?`
      )
    ) {
      return;
    }

    this.limpiar();

    this.srv.Eliminar(
      repartidor.id
    ).subscribe({
      next: () => {
        this.ok.set(
          'Repartidor desactivado correctamente.'
        );

        this.cargar();
      },
      error: (e) => {
        this.error.set(mensajeError(e));
      }
    });
  }

  activar(repartidor: Repartidor) {

    if (!repartidor.id) {
      return;
    }

    this.limpiar();

    const actualizado: Repartidor = {
      nombre: repartidor.nombre,
      telefono: repartidor.telefono ?? '',
      estado: 'ACTIVO'
    };

    this.srv.Actualizar(
      repartidor.id,
      actualizado
    ).subscribe({
      next: () => {
        this.ok.set(
          'Repartidor activado correctamente.'
        );

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