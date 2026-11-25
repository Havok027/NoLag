# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin de Decky Loader (Steam Deck, Legion Go y similares con SteamOS o Bazzite) que ayuda a reducir la latencia y estabilizar la red. Dos módulos independientes: **Wi-Fi** (ajustes de la red local) y **Mudfish** (instalación y servicio, con acceso rápido a su panel web).

## Cómo usa NoLag a Mudfish

NoLag **no configura rutas**. Se ocupa de lo básico y deja el resto al panel web del propio Mudfish (`http://127.0.0.1:8282`):

- **El plugin hace:** instala Mudfish en una carpeta persistente, enciende y apaga el servicio, muestra el ping actual y abre el panel con un toque.
- **El panel de Mudfish hace:** login, ítems/juegos, región, selección de nodo, Multi-Path y todas las rutas.

El panel web no se muestra bien dentro del QAM en el Modo Juego, por eso **Abrir panel de Mudfish** lo abre en el navegador de Steam.

## Pestañas

- **Panel:** ping actual en anillo y gráfico, con jitter y pérdida de paquetes. Con Mudfish encendido y el túnel respondiendo, la medida viene del túnel; si no, de la conexión normal (sin gastar créditos). Después: botón de **Mudfish** (verde cuando está activo), **Abrir panel de Mudfish**, aviso de créditos, tabla Conexión y botón **Optimizar Wi-Fi**.
- **Wi-Fi:** acciones rápidas, optimizaciones, streaming y ajustes avanzados (abajo).
- **Mudfish:** estado en 3 pasos (instalar, entrar en el panel, servicio encendido), interruptor del servicio, **Abrir panel de Mudfish**, guía de primer uso, aviso de créditos, actualización del núcleo (sin campos de login: el login se hace solo en el panel web) y opciones avanzadas (puerto, ruta actual, objetivo del ping, reinstalar, rehacer login, logs).
- **Conf:** mantener encendido al reiniciar (apagado por defecto), perfiles por juego con interruptor de Wi-Fi, idioma (PT, EN, ES) y diagnóstico.

## Mudfish: primer uso (una sola vez)

1. Enciende Mudfish y toca **Abrir panel de Mudfish**. Inicia sesión.
2. En el panel, añade el juego y elige la región (**Auto / South America**), la selección de nodo y el modo (**Basic** o **Multi-Path**).
3. Vuelve al juego.

Este registro se hace una sola vez y queda guardado en la nube de la cuenta de Mudfish. NoLag no cambia estas opciones: después solo enciende y apaga el servicio, a mano (al encenderlo también abre el panel en el navegador elegido).

## Mudfish: protección de créditos

Mudfish cobra por tráfico. Por eso NoLag **siempre arranca con Mudfish apagado**, al encender la consola y al abrir un juego: solo se enciende cuando tú lo pides. Al cerrar cualquier juego, Mudfish se cierra al instante. Encenderlo a mano nunca activa la opción de mantener encendido.

- **Nunca descargues nada con Mudfish encendido** (juegos, actualizaciones, archivos): el tráfico se cobra.
- Prefiere el **ítem del juego** en el panel de Mudfish. **Full VPN** está permitido (para juegos sin ítem en tu región, apúntalo al nodo más cercano, ej.: São Paulo), pero enruta todo el tráfico del sistema: mantén las descargas en segundo plano desactivadas. El botón `?` de la pestaña Mudfish explica cuándo usar cada uno.
- **Multi-Path** (configurado en el panel) mejora la estabilidad y el jitter, pero gasta más créditos.

## Detalles técnicos de Mudfish

- La instalación sigue la guía oficial de SteamOS (instalador con `sh`, servicio `mudrun-headless` sin flags) en una carpeta persistente enlazada en `/opt/mudfish`, y muestra el motivo exacto cuando algo falla.
- El plugin solo **lee** la API local (estado, sesión, telemetría) y usa las rutas oficiales de inicio y parada. Detecta solo si ya iniciaste sesión en el panel.
- **Versión dinámica:** la versión instalada sale siempre de la página oficial de versiones (si no responde, una instalación nueva usa el fallback 6.6.4). La pestaña Mudfish muestra la versión instalada y la última detectada.
- **Desinstalar Mudfish:** botón en la pestaña Mudfish, con confirmación. Cierra los procesos de Mudfish, borra `/opt/mudfish`, la carpeta persistente, logs y restos, y limpia el login y "Mantener encendido" guardados en el plugin. Tu cuenta en la nube de Mudfish no se ve afectada.
- **Actualización del núcleo:** NoLag consulta la página oficial de versiones (como máximo cada 6 horas) y avisa cuando hay un núcleo nuevo. **Actualizar** lo descarga, cambia el binario y reinicia el servicio si estaba encendido. No se instala nada sin tu toque.

## Wi-Fi (módulo independiente)

Pestaña **Wi-Fi**: ajustes de la red local que funcionan con Mudfish encendido o apagado. Orden en pantalla: acciones rápidas, optimizaciones, streaming y avanzado.

- **Acciones rápidas:** **Aplicar optimizaciones seguras** activa todo de una vez; **Restaurar predeterminado** desactiva los ajustes de red y mantiene **Corregir al despertar** activado.
- **Optimizaciones:** desactivar el ahorro de energía, corregir al despertar, buffers de red mayores y cola CAKE.
- **Streaming:** modo streaming (activa los ajustes solo durante un stream) y corrección de streams colgados.
- **Avanzado:** IPv6, bloqueo al punto de acceso, banda preferida y DNS.
- Los ajustes **nunca** se deshacen al cerrar un juego, encender la consola o apagar Mudfish: solo el botón (o la pestaña Wi-Fi) los restaura. Sobreviven a la suspensión, la reconexión y las actualizaciones del sistema (SteamOS y Bazzite). Al desinstalar el plugin, todo se deshace.
- No envía nada a internet. Si el WiFi Optimizer original está instalado, apaga uno de los dos.
- Módulo derivado de WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): ver `THIRD_PARTY_NOTICES.md`.

## Idiomas

Português, English y Español (Conf > Idioma).

## Desarrollo

```
pnpm install
pnpm test
pnpm build
```
