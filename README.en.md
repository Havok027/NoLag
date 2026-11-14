# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar SteamOS devices) that automatically picks the best free network route to the game server.

## How it works

- You enter the game server IP and turn on **Automatic route**.
- The plugin measures ping, jitter and loss through the direct route and through each WireGuard relay, and reroutes only the traffic to that IP through the best path.
- If a relay gets worse, traffic goes back to the direct route. When turned off or unloaded, everything is removed.
- Nothing besides the given IP is changed. Private addresses are rejected.

## Relays (free)

1. Create a free Linux server (for example, Oracle Cloud Always Free) in the region you want and open UDP port 51820.
2. On the server, install WireGuard, enable `net.ipv4.ip_forward=1` and create `wg0.conf`:

```
[Interface]
Address = 10.8.0.1/24
ListenPort = 51820
PrivateKey = <server private key>
PostUp = iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE

[Peer]
PublicKey = <device public key>
AllowedIPs = 10.8.0.2/32
```

3. On the device, create a `.conf` file (its name becomes the relay name) in `~/homebrew/settings/NoLag/relays/`, up to 4 files:

```
[Interface]
PrivateKey = <device private key>
Address = 10.8.0.2/32

[Peer]
PublicKey = <server public key>
Endpoint = <server IP>:51820
```

Requires `ip`, `wg`, `wg-quick`, `iptables` and `ping` on the device.

## Languages

Português, English and Español (Settings > Language).

## Development

```
pnpm install
pnpm test
pnpm build
```
