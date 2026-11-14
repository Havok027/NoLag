# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar SteamOS devices) that automatically picks the best free network route to the game server.

## How to use

Turn on **Automatic route** and open the game. That's it: the plugin detects the server by itself and **Sensitivity** comes preset to Balanced.

- The **Dashboard** shows live ping, jitter and loss, the route in use and, under **Diagnostics**, what the plugin sees from the game. Switch tabs by touch, A or L1/R1; the arrows collapse sections.
- Without a relay, the plugin only monitors ping, jitter and loss to the game server.
- With a relay, it also tests the alternative paths and uses the best one.

## Relays (optional)

1. On a free Linux server (for example, Oracle Cloud Always Free, Ubuntu), run `sudo bash relay-setup.sh` (file in this repository). It installs WireGuard and prints a code. On Oracle, also open UDP port 51820 in the Security List.
2. Preconfigured: put the code on a line of the `relay-code.txt` file at the repository root. The build includes the file in the release and the plugin reads it by itself. Note: the code contains a private key; if the repository is public, anyone can use your relay.
3. Alternative: paste the code under **Relays** (up to 4 relays).

## How it works

- The plugin finds the game opened by Steam and watches (read-only) which IP it sends data to.
- It reroutes only the traffic to the server IP through the best path. If a relay gets worse, it goes back to the direct route. When the game closes, or the plugin is turned off or unloaded, everything is removed.
- Private addresses are never rerouted.
- With relays, it uses `ip`, `wg`, `iptables` and `ping`.

## Languages

Português, English and Español (Settings > Language).

## Development

```
pnpm install
pnpm test
pnpm build
```
