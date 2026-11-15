# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y similares con SteamOS) que elige automáticamente, de forma gratuita, la mejor ruta de red hasta el servidor del juego.

## Cómo usar

Activa la **Ruta automática** y abre el juego. Nada más: el plugin detecta el servidor solo y la **Sensibilidad** viene en Equilibrado.

- El **Panel** muestra ping, jitter y pérdida en vivo, la ruta en uso y, en **Diagnóstico**, lo que el plugin ve del juego. Cambia de pestaña con toque, A o L1/R1; las flechas contraen las secciones.
- El **Panel** también muestra la **Calidad** de la conexión y un **gráfico en vivo** con una línea por ruta. El botón **Y** muestra u oculta la ayuda de cada opción.
- Sin relay, el plugin solo monitorea ping, jitter y pérdida hasta el servidor del juego.
- Activa el interruptor una vez dentro del juego: NoLag guarda su perfil, se activa solo la próxima vez y se apaga al salir. Gestiónalo en Rutas > Perfiles de juegos.
- Con relay, también prueba los caminos alternativos y usa el mejor.

## Relay automático (recomendado)

El usuario solo activa el interruptor. El plugin crea su propia clave WireGuard, se registra solo en los relays de `relay-code.txt` y mide y usa el mejor camino.

Para el dueño del proyecto (una vez):
1. En un servidor gratuito (p. ej. Oracle Cloud Always Free, Ubuntu), pon `relay-server.sh` y `enroll_server.py` en la misma carpeta y ejecuta `sudo bash relay-server.sh NoLag-BR`.
2. En Oracle, abre UDP 51820 y TCP 8077 en la Security List.
3. Pega la línea `nolag2:...` impresa al final en una línea de `relay-code.txt` en la raíz del repositorio. Este código no tiene clave privada y puede estar en un repositorio público.
4. El servidor solo reenvía UDP y ping, con límite de velocidad por dispositivo, y bloquea redes internas.

## Relays (opcional)

1. En un servidor Linux gratuito (por ejemplo, Oracle Cloud Always Free, Ubuntu), ejecuta `sudo bash relay-setup.sh` (archivo de este repositorio). Instala WireGuard e imprime un código. En Oracle, abre también el puerto UDP 51820 en la Security List.
2. Preconfigurado: pon el código en una línea del archivo `relay-code.txt` en la raíz del repositorio. El build incluye el archivo en la release y el plugin lo lee solo. Ojo: el código contiene una clave privada; si el repositorio es público, cualquiera puede usar tu relay.
3. Alternativa: pega el código en **Relays** (hasta 4 relays).

## Mudfish / Rutas (módulo independiente)

Pestaña **Rutas**: instala el Mudfish oficial en una carpeta persistente (sobrevive a las actualizaciones de SteamOS, enlazada en `/opt/mudfish` con `mount --bind`), sigue la guía oficial de SteamOS (instalador con `sh`, servicio `mudrun-headless` sin flags, acceso en el panel), muestra el motivo exacto si la instalación falla, activa y desactiva el servicio y muestra el puerto 8282, la ruta activa y el ping antes y después. "Abrir panel de Mudfish" abre `http://127.0.0.1:8282` para elegir el nodo. Funciona sin Wi-Fi y sin la ruta de NoLag. Mudfish cobra por tráfico.

El Panel tiene un interruptor para Wi-Fi y otro para Mudfish, y la tabla **Conexión** (interfaz, IP, gateway, ping y jitter). Cada juego guardado puede activar Wi-Fi y/o Mudfish solo al abrirse; al salir, solo apaga lo que él mismo activó.

## Wi-Fi (módulo independiente)

Pestaña **Wi-Fi**: optimizaciones de la red local que funcionan solas, sin la ruta de NoLag y sin Mudfish.

- Desactivar el ahorro de energía, corregir al despertar, búferes de red mayores, cola CAKE, IPv6, fijar el punto de acceso, banda preferida y DNS.
- Modo streaming (activa los ajustes solo durante un stream) y corrección de streams detenidos.
- **Aplicar optimizaciones seguras** activa todo de una vez; **Restaurar** devuelve lo predeterminado del sistema.
- Los ajustes sobreviven a suspensión, reconexión y actualizaciones del sistema (SteamOS y Bazzite). Al desinstalar el plugin, todo se deshace.
- No se envía nada a internet. Si el WiFi Optimizer original está instalado, desactiva uno de los dos.
- Módulo derivado de WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): ver `THIRD_PARTY_NOTICES.md`.

## Cómo funciona

- El plugin encuentra el juego abierto por Steam y observa (solo lectura) a qué IP envía datos.
- Desvía solo el tráfico hacia la IP del servidor por el mejor camino. Si un relay empeora, vuelve a la ruta directa. Al cerrar el juego, apagar o descargar el plugin, todo se elimina.
- Las direcciones privadas nunca se desvían.
- Con relays, usa `ip`, `wg`, `iptables` y `ping`.

## Idiomas

Português, English y Español (Config. > Idioma).

## Desarrollo

```
pnpm install
pnpm test
pnpm build
```
