import { Component, computed, effect, input, signal } from '@angular/core';

const FONDOS = [
  'linear-gradient(135deg, #fbdde6, #f4e3a8)',
  'linear-gradient(135deg, #e3efe4, #fbdde6)',
  'linear-gradient(135deg, #f4e3a8, #f7c9d4)',
  'linear-gradient(135deg, #d9e8f5, #fbdde6)',
  'linear-gradient(135deg, #f0e1f5, #f4e3a8)'
];

// Muestra la foto del producto; si no tiene (o falla), un fondo pastel con la inicial.
@Component({
  selector: 'app-foto',
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="nombre()" loading="lazy" (error)="roto.set(true)" />
    } @else {
      <div class="ph" [style.background]="fondo()"><span>{{ inicial() }}</span></div>
    }
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .ph { width: 100%; height: 100%; display: grid; place-items: center; }
    .ph span { font-family: var(--serif); font-size: 2.2em; color: rgba(184, 23, 79, .55); }
  `
})
export class Foto {
  nombre = input.required<string>();
  imagen = input<string | null | undefined>('');

  roto = signal(false);
  src = computed(() => (this.roto() ? '' : this.imagen() || ''));
  inicial = computed(() => (this.nombre() || '?').trim().charAt(0).toUpperCase());
  fondo = computed(() => {
    let h = 0;
    for (const c of this.nombre() || '') h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return FONDOS[h % FONDOS.length];
  });

  constructor() {
    effect(() => { this.imagen(); this.roto.set(false); });
  }
}
