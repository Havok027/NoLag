# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y similares con SteamOS) que elige automáticamente, de forma gratuita, la mejor ruta de red hasta el servidor del juego.

## Cómo usar

Activa la **Ruta automática** y abre el juego. Nada más: el plugin detecta el servidor solo y la **Sensibilidad** viene en Equilibrado.

- El **Panel** muestra ping, jitter y pérdida en vivo, la ruta en uso y, en **Diagnóstico**, lo que el plugin ve del juego. Cambia de pestaña con toque, A o L1/R1; las flechas contraen las secciones.
- El **Panel** también muestra la **Calidad** de la conexión y un **gráfico en vivo** con una línea por ruta. El botón **Y** muestra u oculta la ayuda de cada opción.
- Sin relay, el plugin solo monitorea ping, jitter y pérdida hasta el servidor del juego.
- Con relay, también prueba los caminos alternativos y usa el mejor.

## Relays (opcional)

1. En un servidor Linux gratuito (por ejemplo, Oracle Cloud Always Free, Ubuntu), ejecuta `sudo bash relay-setup.sh` (archivo de este repositorio). Instala WireGuard e imprime un código. En Oracle, abre también el puerto UDP 51820 en la Security List.
2. Preconfigurado: pon el código en una línea del archivo `relay-code.txt` en la raíz del repositorio. El build incluye el archivo en la release y el plugin lo lee solo. Ojo: el código contiene una clave privada; si el repositorio es público, cualquiera puede usar tu relay.
3. Alternativa: pega el código en **Relays** (hasta 4 relays).

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
