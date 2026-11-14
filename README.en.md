# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar SteamOS devices) that automatically picks the best free network route to the game server.

## How to use

1. On a free Linux server (for example, Oracle Cloud Always Free, Ubuntu), run `sudo bash relay-setup.sh` (file in this repository). It installs WireGuard and prints a code. On Oracle, also open UDP port 51820 in the Security List.
2. In the plugin, paste the code under **Relays**. The plugin creates and stores the files by itself (up to 4 relays).
3. Turn on **Automatic route** and open the game.

## How it works

- The plugin finds the game opened by Steam and watches (read-only) which IP it sends data to. Nothing to type.
- It measures ping, jitter and loss through the direct route and through each relay, and reroutes only the traffic to the server IP through the best path.
- If a relay gets worse, traffic goes back to the direct route. When the game closes, or the plugin is turned off or unloaded, everything is removed.
- Private addresses are never rerouted.

Uses `ip`, `wg`, `iptables` and `ping`, which the plugin checks when turned on (no wg-quick).

## Languages

Português, English and Español (Settings > Language).

## Development

```
pnpm install
pnpm test
pnpm build
```
