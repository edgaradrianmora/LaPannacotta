import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  template: `
    <div class="pantalla">
      <aside class="lado" aria-hidden="true">
        <div class="cupula"></div>
        <div class="plato"></div>
        <p class="lema">Pasteles hechos al día,<br />entregados en Comas.</p>
      </aside>
      <div class="caja">
        <h1>La Pannacotta</h1>
        <p class="sub">{{ modoRegistro() ? 'Crea tu cuenta de administración' : 'Ingresa para gestionar pedidos y entregas' }}</p>

        @if (error()) { <div class="alerta alerta-error">{{ error() }}</div> }
        @if (ok()) { <div class="alerta alerta-ok">{{ ok() }}</div> }

        @if (!modoRegistro()) {
          <form [formGroup]="formLogin" (ngSubmit)="entrar()">
            <div class="campo">
              <label for="u">Usuario</label>
              <input id="u" formControlName="username" autocomplete="username"
                     [class.invalido]="invalido(formLogin, 'username')" />
              @if (invalido(formLogin, 'username')) { <span class="msg-error">El usuario es obligatorio.</span> }
            </div>
            <div class="campo">
              <label for="p">Contraseña</label>
              <input id="p" type="password" formControlName="password" autocomplete="current-password"
                     [class.invalido]="invalido(formLogin, 'password')" />
              @if (invalido(formLogin, 'password')) { <span class="msg-error">La contraseña es obligatoria.</span> }
            </div>
            <button class="btn" type="submit" [disabled]="cargando()">
              {{ cargando() ? 'Ingresando…' : 'Ingresar' }}
            </button>
          </form>
          <p class="cambio">¿No tienes cuenta? <a href="#" (click)="cambiar($event, true)">Regístrate</a></p>
        } @else {
          <form [formGroup]="formRegistro" (ngSubmit)="registrar()">
            <div class="campo">
              <label for="n">Nombre completo</label>
              <input id="n" formControlName="nombre" [class.invalido]="invalido(formRegistro, 'nombre')" />
              @if (invalido(formRegistro, 'nombre')) { <span class="msg-error">El nombre es obligatorio.</span> }
            </div>
            <div class="campo">
              <label for="ru">Usuario (4 a 50 caracteres)</label>
              <input id="ru" formControlName="username" [class.invalido]="invalido(formRegistro, 'username')" />
              @if (invalido(formRegistro, 'username')) { <span class="msg-error">Debe tener entre 4 y 50 caracteres.</span> }
            </div>
            <div class="campo">
              <label for="rp">Contraseña (mínimo 6)</label>
              <input id="rp" type="password" formControlName="password" [class.invalido]="invalido(formRegistro, 'password')" />
              @if (invalido(formRegistro, 'password')) { <span class="msg-error">Mínimo 6 caracteres.</span> }
            </div>
            <button class="btn" type="submit" [disabled]="cargando()">
              {{ cargando() ? 'Creando…' : 'Crear cuenta' }}
            </button>
          </form>
          <p class="cambio">¿Ya tienes cuenta? <a href="#" (click)="cambiar($event, false)">Inicia sesión</a></p>
        }
      </div>
    </div>
  `,
  styles: `
    .pantalla { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 120px); border-radius: 28px; overflow: hidden; background: var(--papel); box-shadow: var(--sombra); border: 1px solid var(--borde); }
    .lado { position: relative; background: linear-gradient(160deg, #fbdde6 0%, #f4e3a8 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 36px; overflow: hidden; }
    .cupula { position: absolute; left: 50%; top: 22%; width: 260px; height: 190px; transform: translateX(-50%); background: #fff7f5; border-radius: 130px 130px 24px 24px; box-shadow: inset -14px -10px 0 rgba(184,23,79,.10); }
    .cupula::before { content: ''; position: absolute; left: 50%; top: -18px; width: 34px; height: 34px; margin-left: -17px; background: var(--frambuesa); border-radius: 50%; }
    .cupula::after { content: ''; position: absolute; left: 22px; right: 22px; top: 0; height: 58px; background: var(--frambuesa); opacity: .85; border-radius: 120px 120px 40px 40px / 90px 90px 30px 30px; clip-path: polygon(0 0, 100% 0, 100% 55%, 88% 100%, 78% 60%, 62% 90%, 48% 55%, 30% 100%, 18% 62%, 0 85%); }
    .plato { position: absolute; left: 50%; top: calc(22% + 186px); width: 340px; height: 22px; transform: translateX(-50%); background: var(--pistacho); border-radius: 50%; opacity: .9; }
    .lema { font-family: var(--serif); font-size: 1.6rem; color: var(--tinta); line-height: 1.25; position: relative; }
    .caja { padding: 56px 48px; display: flex; flex-direction: column; justify-content: center; }
    .sub { color: var(--suave); margin: 8px 0 26px; }
    form { display: flex; flex-direction: column; gap: 16px; }
    .cambio { margin-top: 20px; font-size: .93rem; }
    a { color: var(--frambuesa); font-weight: 600; }
    @media (max-width: 800px) { .pantalla { grid-template-columns: 1fr; } .lado { display: none; } .caja { padding: 36px 24px; } }
  `
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  modoRegistro = signal(false);
  cargando = signal(false);
  error = signal('');
  ok = signal('');

  formLogin = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  formRegistro = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  invalido(f: { get(n: string): { invalid: boolean; touched: boolean } | null }, campo: string) {
    const c = f.get(campo);
    return !!c && c.invalid && c.touched;
  }

  cambiar(e: Event, registro: boolean) {
    e.preventDefault();
    this.error.set('');
    this.ok.set('');
    this.modoRegistro.set(registro);
  }

  entrar() {
    if (this.formLogin.invalid) { this.formLogin.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);
    this.auth.login(this.formLogin.getRawValue()).subscribe({
      next: () => { this.cargando.set(false); this.router.navigate([this.auth.rutaInicio()]); },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }

  registrar() {
    if (this.formRegistro.invalid) { this.formRegistro.markAllAsTouched(); return; }
    this.error.set('');
    this.cargando.set(true);
    const datos = this.formRegistro.getRawValue();
    this.auth.registrar(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.ok.set('Cuenta creada. Ya puedes iniciar sesión.');
        this.formLogin.patchValue({ username: datos.username, password: '' });
        this.modoRegistro.set(false);
      },
      error: (e) => { this.cargando.set(false); this.error.set(mensajeError(e)); }
    });
  }
}
