# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y similares con SteamOS) que elige automáticamente, de forma gratuita, la mejor ruta de red hasta el servidor del juego.

## Cómo usar

1. En un servidor Linux gratuito (por ejemplo, Oracle Cloud Always Free, Ubuntu), ejecuta `sudo bash relay-setup.sh` (archivo de este repositorio). Instala WireGuard e imprime un código. En Oracle, abre también el puerto UDP 51820 en la Security List.
2. En el plugin, pega el código en **Relays**. El plugin crea y guarda los archivos por sí solo (hasta 4 relays).
3. Activa la **Ruta automática** y abre el juego.

## Cómo funciona

- El plugin encuentra el juego abierto por Steam y observa (solo lectura) a qué IP envía datos. No hay que escribir nada.
- Mide ping, jitter y pérdida por la ruta directa y por cada relay, y desvía solo el tráfico hacia la IP del servidor por el mejor camino.
- Si un relay empeora, el tráfico vuelve a la ruta directa. Al cerrar el juego, apagar o descargar el plugin, todo se elimina.
- Las direcciones privadas nunca se desvían.

Usa `ip`, `wg`, `iptables` y `ping`, que el plugin comprueba al activarse (sin wg-quick).

## Idiomas

Português, English y Español (Config. > Idioma).

## Desarrollo

```
pnpm install
pnpm test
pnpm build
```
