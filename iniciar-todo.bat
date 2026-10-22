@echo off
setlocal EnableExtensions EnableDelayedExpansion
title La Pannacotta - Inicio diario con Kubernetes

rem ============================================================
rem  INICIAR-TODO.BAT  -  La Pannacotta sobre Minikube
rem  Solo ENCIENDE y despliega lo que ya esta definido en k8s.
rem  No edita archivos del proyecto ni borra nada.
rem
rem  Uso diario ................ doble clic
rem  Despues de cambiar codigo . iniciar-todo.bat reconstruir
rem ============================================================

rem ---------- OPCIONES ----------
set RECONSTRUIR_IMAGENES=0
rem Solo se usan al CREAR el cluster por primera vez
set MEMORIA_MINIKUBE=6144
set CPUS_MINIKUBE=4
rem ------------------------------

if /i "%~1"=="reconstruir" set RECONSTRUIR_IMAGENES=1

cd /d "%~dp0"
set "RAIZ=%~dp0"
set REINICIAR=0

echo.
echo ============================================================
echo   LA PANNACOTTA - INICIO DIARIO CON KUBERNETES
echo ============================================================
echo.

rem ---------------- 1. Herramientas ----------------
echo [1/7] Verificando herramientas...
set FALTA=0
for %%T in (docker minikube kubectl npm) do (
    where %%T >nul 2>&1
    if errorlevel 1 (
        echo   [ERROR] No se encontro %%T - instalalo y vuelve a intentar
        set FALTA=1
    ) else (
        echo   [OK] %%T
    )
)
if "!FALTA!"=="1" (
    pause
    exit /b 1
)
docker info >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] Docker no esta corriendo.
    echo           Abre Docker Desktop, espera a que diga Engine running y repite.
    pause
    exit /b 1
)
echo   [OK] Docker activo
echo.

rem ---------------- 2. Angular (en paralelo) ----------------
echo [2/7] Frontend Angular...
netstat -ano | findstr /R /C:":4200 .*LISTENING" >nul
if not errorlevel 1 (
    echo   [--] El puerto 4200 ya esta en uso - se asume que Angular ya corre
) else (
    start "Angular - pannacotta-web" /D "!RAIZ!pannacotta-web" cmd /k "if not exist node_modules (npm install) & npm start"
    echo   [OK] Angular iniciando en una ventana nueva
)
echo.

rem ---------------- 3. Minikube ----------------
echo [3/7] Minikube...
docker container inspect minikube >nul 2>&1
if errorlevel 1 (
    echo   Primera vez: creando el cluster con !MEMORIA_MINIKUBE! MB y !CPUS_MINIKUBE! CPUs...
    minikube start --memory=!MEMORIA_MINIKUBE! --cpus=!CPUS_MINIKUBE!
) else (
    minikube start
)
if errorlevel 1 (
    echo   [ERROR] Minikube no pudo iniciar. Revisa el mensaje de arriba.
    echo           Si dice que Docker tiene poca memoria, subela en Docker Desktop.
    pause
    exit /b 1
)
echo   [OK] Minikube activo
echo.

rem ---------------- 4. Imagenes dentro de Minikube ----------------
echo [4/7] Imagenes de los servicios...
echo       La primera vez tarda entre 15 y 30 minutos. Despues ya no se repite.
minikube image ls > "%TEMP%\pannacotta-imagenes.txt" 2>nul
for %%P in (Eureka:eureka Gateway:gateway Auth:auth Productos:productos Pedidos:pedidos Delivery:delivery Notificaciones:notificaciones) do (
    for /f "tokens=1,2 delims=:" %%A in ("%%P") do (
        set CONSTRUIR=0
        findstr /C:"pannacotta-%%B:1.0" "%TEMP%\pannacotta-imagenes.txt" >nul 2>&1
        if errorlevel 1 set CONSTRUIR=1
        if "!RECONSTRUIR_IMAGENES!"=="1" set CONSTRUIR=1
        if "!CONSTRUIR!"=="1" (
            if exist "!RAIZ!%%A\Dockerfile" (
                echo   Construyendo pannacotta-%%B:1.0 ...
                minikube image build -t pannacotta-%%B:1.0 "!RAIZ!%%A"
                if errorlevel 1 (
                    echo   [ERROR] Fallo la construccion de %%B
                ) else (
                    echo   [OK] pannacotta-%%B:1.0 lista
                )
            ) else (
                echo   [ERROR] %%A no tiene Dockerfile - se omite
            )
        ) else (
            echo   [OK] pannacotta-%%B:1.0 ya existe
        )
    )
)
if "!RECONSTRUIR_IMAGENES!"=="1" set REINICIAR=1
echo.

rem ---------------- 5. Base de datos y RabbitMQ ----------------
echo [5/7] Base de datos y RabbitMQ...
kubectl apply -f "!RAIZ!k8s\k8s00-infra.yaml" >nul
if errorlevel 1 (
    echo   [ERROR] No se pudo aplicar k8s00-infra.yaml
    pause
    exit /b 1
)
kubectl wait --for=condition=available deployment/postgres deployment/rabbitmq --timeout=240s >nul 2>&1
set PG_LISTO=0
for /l %%I in (1,1,40) do (
    if "!PG_LISTO!"=="0" (
        kubectl exec deploy/postgres -- pg_isready -h 127.0.0.1 -U postgres >nul 2>&1
        if errorlevel 1 (timeout /t 3 /nobreak >nul) else (set PG_LISTO=1)
    )
)
if "!PG_LISTO!"=="0" (
    echo   [ERROR] PostgreSQL no respondio a tiempo. Revisa con: kubectl get pods
    pause
    exit /b 1
)
echo   [OK] PostgreSQL listo
call :sembrar bd_auth usuario 02-bd_auth.sql
call :sembrar bd_productos producto 03-bd_productos.sql
echo.

rem ---------------- 6. Aplicacion y monitoreo ----------------
echo [6/7] Desplegando aplicacion y monitoreo...
if exist "!RAIZ!Notificaciones\secrets.properties" (
    kubectl create secret generic notificaciones-mail --from-file=secrets.properties="!RAIZ!Notificaciones\secrets.properties" --dry-run=client -o yaml | kubectl apply -f - >nul
    echo   [OK] Credenciales de correo cargadas en el cluster
) else (
    echo   [--] No existe Notificaciones\secrets.properties - los correos no se enviaran
)
kubectl apply -f k8s >nul
if errorlevel 1 (
    echo   [ERROR] kubectl apply reporto un error - revisa el mensaje de arriba
)
if "!REINICIAR!"=="1" (
    echo   Reiniciando servicios para usar las imagenes nuevas...
    kubectl rollout restart deployment/eureka deployment/gateway deployment/auth deployment/productos deployment/pedidos deployment/delivery deployment/notificaciones >nul 2>&1
)
echo   Esperando a que los pods arranquen...
kubectl wait --for=condition=available deployment --all --timeout=240s >nul 2>&1
if errorlevel 1 (
    echo   [AVISO] Algun servicio tardo en iniciar. Revisa con: kubectl get pods
) else (
    echo   [OK] Todos los despliegues estan activos
)
echo.

rem ---------------- 7. Port-forward ----------------
echo [7/7] Abriendo accesos...
call :reenviar Gateway 8771 gateway 8771
call :reenviar Eureka 8761 eureka 8761
call :reenviar RabbitMQ 15672 rabbitmq 15672
call :reenviar Grafana 3000 grafana 3000
call :reenviar Prometheus 9090 prometheus 9090

echo.
echo ============================================================
echo   LISTO. Direcciones:
echo     Aplicacion Angular ... http://localhost:4200
echo     Gateway .............. http://localhost:8771
echo     Eureka ............... http://localhost:8761
echo     RabbitMQ ............. http://localhost:15672   guest / guest
echo     Grafana .............. http://localhost:3000    admin / admin
echo     Prometheus ........... http://localhost:9090
echo.
echo   Los servicios Java tardan 1 o 2 minutos mas en registrarse.
echo   Si algo falla, mira el estado con:  kubectl get pods
echo   No cierres las ventanas abiertas: son los accesos.
echo ============================================================
echo.
pause
exit /b 0

rem ============================================================
rem  Subrutinas
rem ============================================================

:sembrar
rem  %1 = base   %2 = tabla   %3 = archivo en infra\db
set TBL=
if not exist "!RAIZ!infra\db\%~3" (
    echo   [--] Sin datos de ejemplo para %~1 - se omite
    exit /b 0
)
for /f "usebackq delims=" %%T in (`kubectl exec deploy/postgres -- psql -U postgres -d %~1 -tAc "SELECT to_regclass('public.%~2')"`) do set TBL=%%T
if defined TBL (
    echo   [--] %~1 ya tiene su estructura - no se importa nada
    exit /b 0
)
kubectl exec -i deploy/postgres -- psql -U postgres -d %~1 -q < "!RAIZ!infra\db\%~3" >nul 2>&1
if errorlevel 1 (
    echo   [ERROR] No se pudieron cargar los datos de %~1
) else (
    echo   [OK] Datos de ejemplo cargados en %~1
)
exit /b 0

:reenviar
rem  %1 = nombre   %2 = puerto local   %3 = servicio   %4 = puerto del servicio
netstat -ano | findstr /R /C:":%~2 .*LISTENING" >nul
if not errorlevel 1 (
    echo   [--] Puerto %~2 ya en uso - se asume que %~1 ya es accesible
    exit /b 0
)
start "port-forward %~1" cmd /k kubectl port-forward svc/%~3 %~2:%~4
echo   [OK] %~1 en http://localhost:%~2
exit /b 0
