# La Pannacotta

Sistema de pedidos con microservicios (Spring Boot) y frontend Angular. Todo el backend, PostgreSQL, RabbitMQ y el monitoreo corren dentro de **Minikube** (Kubernetes); el frontend corre en tu PC.

| Componente | Dónde corre | Acceso |
|---|---|---|
| Angular | Tu PC (`npm start`) | http://localhost:4200 |
| Gateway | Minikube | http://localhost:8771 |
| Eureka | Minikube | http://localhost:8761 |
| Auth, Productos, Pedidos, Delivery, Notificaciones | Minikube | A través del Gateway |
| PostgreSQL (4 bases) y RabbitMQ | Minikube | RabbitMQ: http://localhost:15672 (`guest` / `guest`) |
| Grafana | Minikube | http://localhost:3000 (`admin` / `admin`) |
| Prometheus | Minikube | http://localhost:9090 |

## 1. Requisitos (instalar una sola vez)

- **Docker Desktop**, abierto y en estado *Engine running*. Asígnale **al menos 7 GB de memoria** (Settings > Resources). Equipo recomendado: 16 GB de RAM.
- **Minikube** y **kubectl**
- **Node.js 22 LTS** (comprueba con `node -v`)

No necesitas instalar Java ni Maven: los servicios se compilan dentro de Docker.

## 2. Primera vez

1. Clona el repositorio.
2. *(Opcional, para que se envíen correos)* crea el archivo `Notificaciones/secrets.properties` con tu Gmail y una [contraseña de aplicación](https://myaccount.google.com/apppasswords):
   ```properties
   spring.mail.username=tu_correo@gmail.com
   spring.mail.password=tu_clave_de_aplicacion_sin_espacios
   ```
   Sin este archivo todo funciona, pero los correos no se envían.
3. Haz **doble clic en `iniciar-todo.bat`**.

> **La primera ejecución tarda entre 15 y 30 minutos**: crea el cluster, construye las 7 imágenes y carga los datos de ejemplo. Es normal. No se repite.

**Usuarios de prueba:** `edgaradrianmora` / `pannacotta`   ADMIN
**Usuarios de prueba:** `camilarova` / `pannacotta`  CLIENTE



## 3. Uso diario

Haz **doble clic en `iniciar-todo.bat`**. Tarda unos pocos minutos. Hace esto, en orden:

1. Comprueba que tengas Docker, Minikube, kubectl y npm.
2. Abre Angular en una ventana (`npm start`; la primera vez ejecuta `npm install`).
3. Inicia Minikube.
4. Construye las imágenes que falten (las que ya existen las salta).
5. Despliega PostgreSQL y RabbitMQ y, **solo si la base está vacía**, carga los usuarios y productos de ejemplo de `infra/db/`.
6. Despliega los microservicios y el monitoreo (`kubectl apply -f k8s`).
7. Abre los accesos (`port-forward`) a Gateway, Eureka, RabbitMQ, Grafana y Prometheus.

Espera 1 o 2 minutos más a que los servicios Java terminen de registrarse en Eureka. Luego abre http://localhost:4200.

> **No cierres las ventanas que se abren** (Angular y los `port-forward`): son los accesos en ejecución.

### Después de cambiar código Java

Las imágenes ya construidas no se actualizan solas. Para reconstruirlas, abre una consola en la raíz del proyecto y ejecuta:

```bash
iniciar-todo.bat reconstruir
```

Reconstruye las 7 imágenes y reinicia los servicios (tarda varios minutos). Los cambios en el frontend no necesitan esto: Angular se recarga solo.

## 4. Apagar al terminar

Cierra las ventanas abiertas y ejecuta:

```bash
minikube stop
```

Esto **conserva todos los datos** (la base de datos vive en un volumen del cluster). **Nunca ejecutes `minikube delete`** salvo que quieras empezar de cero: borra la base de datos y las imágenes.

## 5. Problemas frecuentes

- **"No se encontró X"**: instala esa herramienta (ver Requisitos) y vuelve a ejecutar.
- **"Docker no está corriendo"**: abre Docker Desktop y espera a que termine de iniciar.
- **Minikube no inicia por poca memoria**: sube la memoria de Docker Desktop (Settings > Resources) a 7 GB o más.
- **"Puerto ya en uso"**: otra cosa usa ese puerto. Si tienes contenedores de otro modo de ejecución (por ejemplo `docker compose` o los de la carpeta `infra`), deténlos: `docker compose stop` y `docker stop rabbitmq postgres-pannacotta`. **No uses ese modo y este a la vez.**
- **Angular carga pero no hay datos o da error de red**: los servicios aún se están registrando. Espera 1 o 2 minutos y recarga. Revisa el estado con `kubectl get pods`: todos deben decir `Running`.
- **Un pod dice `ErrImageNeverPull`**: falta su imagen. Ejecuta `iniciar-todo.bat reconstruir`.
- **No llegan los correos**: revisa que exista `Notificaciones/secrets.properties`. Si lo creaste o cambiaste después de iniciar, ejecuta `kubectl delete pod -l app=notificaciones` para que cargue la clave nueva.
- **No hay usuarios de ejemplo** (si `infra/db/` no tiene los `.sql`): regístrate en la aplicación y conviértete en administrador con
  ```bash
  kubectl exec deploy/postgres -- psql -U postgres -d bd_auth -c "UPDATE usuario SET rol='ADMIN' WHERE username='TU_USUARIO';"
  ```
  Luego cierra sesión y vuelve a entrar.

## 6. Datos de ejemplo (para quien mantiene el proyecto)

Los archivos `infra/db/02-bd_auth.sql` y `infra/db/03-bd_productos.sql` contienen los usuarios y productos de ejemplo. Se cargan automáticamente **una sola vez**, cuando las tablas aún no existen en el cluster. Si cambias los datos y quieres compartirlos, vuelve a exportarlos con `pg_dump` y reemplaza esos dos archivos.
