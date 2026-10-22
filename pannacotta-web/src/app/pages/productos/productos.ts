import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../core/models';
import { mensajeError } from '../../core/errores';
import { procesarImagen } from '../../core/imagen';
import { Foto } from '../../shared/foto';

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, CurrencyPipe, Foto],
  template: `
    <div class="cabecera">
      <div class="pagina-titulo" style="margin:0">
        <h1>Vitrina de productos</h1>
        <p>{{ productos().length }} productos registrados</p>
      </div>
      <button class="btn" (click)="nuevo()">Agregar producto</button>
    </div>

    @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }
    @if (ok()) { <div class="alerta alerta-ok">{{ ok() }}</div> }

    <div class="filtros">
      <input class="buscar" type="search" placeholder="Buscar por nombre…" [value]="busqueda()" (input)="busqueda.set($any($event.target).value)" aria-label="Buscar producto" />
      <div class="chips">
        <button type="button" class="chip" [class.on]="categoria() === ''" (click)="categoria.set('')">Todos</button>
        @for (c of categorias(); track c) {
          <button type="button" class="chip" [class.on]="categoria() === c" (click)="categoria.set(c)">{{ c }}</button>
        }
      </div>
    </div>

    @if (cargando()) {
      <p class="vacio">Cargando la vitrina…</p>
    } @else {
      <div class="vitrina">
        @for (p of filtrados(); track p.id) {
          <article class="pastel" [class.apagado]="p.estado === 'INACTIVO'">
            <div class="foto">
              <app-foto [nombre]="p.nombre" [imagen]="p.imagenUrl" />
              <span class="precio">{{ p.precio | currency: 'S/ ' }}</span>
              @if (p.estado === 'INACTIVO') { <span class="fuera">Fuera de carta</span> }
            </div>
            <div class="cuerpo">
              <small class="cat">{{ p.categoria }}</small>
              <h3>{{ p.nombre }}</h3>
              <p class="desc">{{ p.descripcion || 'Sin descripción.' }}</p>
              <div class="pie">
                <span class="etiqueta" [class.etiqueta-ok]="p.stock > 5" [class.etiqueta-aviso]="p.stock > 0 && p.stock <= 5" [class.etiqueta-mal]="p.stock <= 0">
                  {{ p.stock <= 0 ? 'Agotado' : p.stock + ' disponibles' }}
                </span>
                <span class="acciones">
                  <button class="btn btn-borde btn-chico" (click)="editar(p)">Editar</button>
                  <button class="btn btn-peligro btn-chico" (click)="eliminar(p)">Eliminar</button>
                </span>
              </div>
            </div>
          </article>
        } @empty {
          <p class="vacio vacio-grande">
            {{ productos().length === 0 ? 'La vitrina está vacía. Agrega tu primer producto.' : 'Ningún producto coincide con la búsqueda.' }}
          </p>
        }
      </div>
    }

    @if (mostrarForm()) {
      <div class="fondo" (click)="cancelar()"></div>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
        <h2 id="titulo-modal">{{ editandoId() ? 'Editar producto' : 'Nuevo producto' }}</h2>
        <form [formGroup]="form" (ngSubmit)="guardar()">
          <div class="subida">
            <div class="previa"><app-foto [nombre]="form.controls.nombre.value || 'Nuevo'" [imagen]="form.controls.imagenUrl.value" /></div>
            <div class="subida-datos">
              <label class="btn btn-borde btn-chico" for="archivo">{{ form.controls.imagenUrl.value ? 'Cambiar foto' : 'Subir foto' }}</label>
              <input id="archivo" type="file" accept="image/*" (change)="elegirFoto($event)" hidden />
              @if (form.controls.imagenUrl.value) {
                <button type="button" class="btn btn-peligro btn-chico" (click)="quitarFoto()">Quitar</button>
              }
              <small>JPG, PNG o WEBP. Se reduce sola a un tamaño liviano.</small>
              @if (errorFoto()) { <span class="msg-error">{{ errorFoto() }}</span> }
            </div>
          </div>

          <div class="rejilla">
            <div class="campo">
              <label for="nombre">Nombre</label>
              <input id="nombre" formControlName="nombre" [class.invalido]="inv('nombre')" />
              @if (inv('nombre')) { <span class="msg-error">El nombre es obligatorio.</span> }
            </div>
            <div class="campo">
              <label for="categoria">Categoría</label>
              <input id="categoria" formControlName="categoria" list="lista-cats" [class.invalido]="inv('categoria')" />
              <datalist id="lista-cats">@for (c of categorias(); track c) { <option [value]="c"></option> }</datalist>
              @if (inv('categoria')) { <span class="msg-error">La categoría es obligatoria.</span> }
            </div>
            <div class="campo">
              <label for="precio">Precio (S/)</label>
              <input id="precio" type="number" step="0.01" formControlName="precio" [class.invalido]="inv('precio')" />
              @if (inv('precio')) { <span class="msg-error">Debe ser mayor a 0.</span> }
            </div>
            <div class="campo">
              <label for="stock">Stock</label>
              <input id="stock" type="number" formControlName="stock" [class.invalido]="inv('stock')" />
              @if (inv('stock')) { <span class="msg-error">Debe ser 0 o más.</span> }
            </div>
            <div class="campo">
              <label for="estado">Estado</label>
              <select id="estado" formControlName="estado">
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </div>
          </div>
          <div class="campo" style="margin-top:16px">
            <label for="descripcion">Descripción</label>
            <textarea id="descripcion" rows="2" formControlName="descripcion"></textarea>
          </div>
          <div class="acciones" style="margin-top:20px">
            <button class="btn" type="submit" [disabled]="guardando()">{{ guardando() ? 'Guardando…' : 'Guardar producto' }}</button>
            <button class="btn btn-borde" type="button" (click)="cancelar()">Cancelar</button>
          </div>
        </form>
      </div>
    }
  `,
  styles: `
    .filtros { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; margin-bottom: 22px; }
    .buscar { max-width: 300px; border-radius: 999px; padding-left: 18px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { border: 1.5px solid var(--borde); background: var(--papel); color: var(--suave); font: inherit; font-weight: 600; font-size: .88rem; padding: 6px 15px; border-radius: 999px; cursor: pointer; }
    .chip:hover { border-color: var(--frambuesa); color: var(--frambuesa); }
    .chip.on { background: var(--tinta); border-color: var(--tinta); color: #fff; }

    .vitrina { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 24px; }
    .pastel { background: var(--papel); border: 1px solid var(--borde); border-radius: 22px; overflow: hidden; display: flex; flex-direction: column; box-shadow: var(--sombra); transition: transform .18s; }
    .pastel:hover { transform: translateY(-3px); }
    .pastel.apagado .foto { filter: grayscale(.8) opacity(.7); }
    .foto { position: relative; aspect-ratio: 4 / 3; }
    .foto app-foto { font-size: 1.1rem; }
    .precio { position: absolute; right: 14px; bottom: -14px; background: var(--mantequilla); color: var(--tinta); font-weight: 700; padding: 7px 14px; border-radius: 999px; transform: rotate(-4deg); box-shadow: 0 3px 8px rgba(122, 92, 0, .2); }
    .fuera { position: absolute; left: 12px; top: 12px; background: var(--tinta); color: #fff; font-size: .78rem; font-weight: 600; padding: 4px 11px; border-radius: 999px; }
    .cuerpo { padding: 22px 18px 18px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .cat { color: var(--pistacho); font-weight: 700; font-size: .8rem; }
    .desc { color: var(--suave); font-size: .9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em; }
    .pie { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; padding-top: 12px; flex-wrap: wrap; }
    .vacio-grande { grid-column: 1 / -1; }

    .fondo { position: fixed; inset: 0; background: rgba(42, 26, 32, .45); z-index: 40; }
    .modal { position: fixed; z-index: 50; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(680px, calc(100vw - 28px)); max-height: calc(100vh - 28px); overflow-y: auto; background: var(--papel); border-radius: 24px; padding: 28px; box-shadow: 0 24px 60px rgba(42, 26, 32, .3); }
    .modal h2 { margin-bottom: 18px; }
    .subida { display: flex; gap: 18px; align-items: center; margin-bottom: 22px; padding: 14px; border: 1.5px dashed #e3b9c6; border-radius: 18px; background: var(--leche); }
    .previa { width: 120px; height: 90px; border-radius: 14px; overflow: hidden; flex: none; font-size: .5rem; }
    .subida-datos { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
    .subida-datos small { flex-basis: 100%; color: var(--suave); }
    label.btn { cursor: pointer; }
  `
})
export class Productos implements OnInit {
  private fb = inject(FormBuilder);
  private srv = inject(ProductoService);

  productos = signal<Producto[]>([]);
  busqueda = signal('');
  categoria = signal('');
  cargando = signal(false);
  guardando = signal(false);
  mostrarForm = signal(false);
  editandoId = signal<number | null>(null);
  error = signal('');
  ok = signal('');
  errorFoto = signal('');

  categorias = computed(() => [...new Set(this.productos().map((p) => p.categoria).filter(Boolean))].sort());
  filtrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    const c = this.categoria();
    return this.productos().filter((p) => (!c || p.categoria === c) && (!q || p.nombre.toLowerCase().includes(q)));
  });

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    categoria: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    estado: ['ACTIVO', Validators.required],
    imagenUrl: ['']
  });

  ngOnInit() { this.cargar(); }

  inv(campo: string) {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  cargar() {
    this.cargando.set(true);
    this.srv.Listar().subscribe({
      next: (lista) => { this.productos.set(lista); this.cargando.set(false); },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  nuevo() {
    this.limpiarMensajes();
    this.editandoId.set(null);
    this.form.reset({ nombre: '', descripcion: '', categoria: '', precio: 0, stock: 0, estado: 'ACTIVO', imagenUrl: '' });
    this.mostrarForm.set(true);
  }

  editar(p: Producto) {
    this.limpiarMensajes();
    this.editandoId.set(p.id ?? null);
    this.form.reset({
      nombre: p.nombre, descripcion: p.descripcion ?? '', categoria: p.categoria,
      precio: p.precio, stock: p.stock, estado: p.estado, imagenUrl: p.imagenUrl ?? ''
    });
    this.mostrarForm.set(true);
  }

  cancelar() { this.mostrarForm.set(false); }

  async elegirFoto(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo) return;
    this.errorFoto.set('');
    try {
      this.form.controls.imagenUrl.setValue(await procesarImagen(archivo));
    } catch (e) {
      this.errorFoto.set((e as Error).message);
    }
  }

  quitarFoto() { this.form.controls.imagenUrl.setValue(''); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.limpiarMensajes();
    this.guardando.set(true);
    const datos = this.form.getRawValue() as Producto;
    const id = this.editandoId();
    const peticion = id ? this.srv.Actualizar(id, datos) : this.srv.Registrar(datos);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.mostrarForm.set(false);
        this.ok.set(id ? 'Producto actualizado.' : 'Producto creado.');
        this.cargar();
      },
      error: (e) => { this.guardando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  eliminar(p: Producto) {
    if (!p.id || !confirm(`¿Eliminar "${p.nombre}"?`)) return;
    this.limpiarMensajes();
    this.srv.Eliminar(p.id).subscribe({
      next: () => { this.ok.set('Producto eliminado.'); this.cargar(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  private limpiarMensajes() { this.error.set(''); this.ok.set(''); }
}
