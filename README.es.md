# NoLag

[Português](README.md) | [English](README.en.md) | **Español**

Plugin para Decky Loader (Steam Deck, Legion Go y similares con SteamOS) que elige automáticamente, de forma gratuita, la mejor ruta de red hasta el servidor del juego.

## Cómo funciona

- Indicas la IP del servidor del juego y activas la **Ruta automática**.
- El plugin mide ping, jitter y pérdida por la ruta directa y por cada relay WireGuard, y desvía solo el tráfico hacia esa IP por el mejor camino.
- Si un relay empeora, el tráfico vuelve a la ruta directa. Al apagarlo o descargar el plugin, todo se elimina.
- No se cambia nada más que esa IP. Las direcciones privadas se rechazan.

## Relays (gratuitos)

1. Crea un servidor Linux gratuito (por ejemplo, Oracle Cloud Always Free) en la región deseada y abre el puerto UDP 51820.
2. En el servidor, instala WireGuard, activa `net.ipv4.ip_forward=1` y crea `wg0.conf`:

```
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <clave privada del servidor>
PostUp = iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

[Peer]
PublicKey = <clave pública del dispositivo>
AllowedIPs = 10.8.0.2/32
```

3. En el dispositivo, crea un archivo `.conf` (el nombre pasa a ser el nombre del relay) en `~/homebrew/settings/NoLag/relays/`, hasta 4 archivos:

```
[Interface]
PrivateKey = <clave privada del dispositivo>
Address = 10.8.0.2/32

[Peer]
PublicKey = <clave pública del servidor>
Endpoint = <IP del servidor>:51820
```

Requiere `ip`, `wg`, `wg-quick`, `iptables` y `ping` en el dispositivo.

## Idiomas

Português, English y Español (Config. > Idioma).

## Desarrollo

```
pnpm install
pnpm test
pnpm build
```
