# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar SteamOS devices) that automatically picks the best free network route to the game server.

## How to use

Turn on **Automatic route** and open the game. That's it: the plugin detects the server by itself and **Sensitivity** comes preset to Balanced.

- The **Dashboard** shows live ping, jitter and loss, the route in use and, under **Diagnostics**, what the plugin sees from the game. Switch tabs by touch, A or L1/R1; the arrows collapse sections.
- The **Dashboard** also shows connection **Quality** and a **live chart** with one line per route. The **Y** button shows or hides help for each option.
- Without a relay, the plugin only monitors ping, jitter and loss to the game server.
- Turn the switch on once inside a game: NoLag saves its profile, turns on by itself next time and turns off when you leave. Manage under Routes > Game profiles.
- With a relay, it also tests the alternative paths and uses the best one.

## Automatic relay (recommended)

The user only turns the switch on. The plugin creates its own WireGuard key, registers itself on the relays listed in `relay-code.txt` and measures and uses the best path.

For the project owner (once):
1. On a free server (e.g. Oracle Cloud Always Free, Ubuntu), put `relay-server.sh` and `enroll_server.py` in the same folder and run `sudo bash relay-server.sh NoLag-BR`.
2. On Oracle, open UDP 51820 and TCP 8077 in the Security List.
3. Paste the `nolag2:...` line printed at the end into a line of `relay-code.txt` at the repository root. This code has no private key and can stay in a public repository.
4. The server only forwards UDP and ping, with a per-device speed limit, and blocks internal networks.

## Relays (optional)

1. On a free Linux server (for example, Oracle Cloud Always Free, Ubuntu), run `sudo bash relay-setup.sh` (file in this repository). It installs WireGuard and prints a code. On Oracle, also open UDP port 51820 in the Security List.
2. Preconfigured: put the code on a line of the `relay-code.txt` file at the repository root. The build includes the file in the release and the plugin reads it by itself. Note: the code contains a private key; if the repository is public, anyone can use your relay.
3. Alternative: paste the code under **Relays** (up to 4 relays).

## Mudfish / Routes (independent module)

**Routes** tab: installs the official Mudfish in a persistent folder (survives SteamOS updates, bound to `/opt/mudfish` with `mount --bind`), follows the official SteamOS guide (installer run with `sh`, `mudrun-headless` service without flags, sign-in on the panel), shows the exact reason when the install fails, turns the service on and off and shows port 8282, the active route and the ping before and after. "Open Mudfish panel" opens `http://127.0.0.1:8282` so you can pick the node. It works without Wi-Fi and without the NoLag route. Mudfish charges by traffic.

The Dashboard has one switch for Wi-Fi and another for Mudfish, plus the **Connection** table (interface, IP, gateway, ping and jitter). Each saved game can turn Wi-Fi and/or Mudfish on by itself when it opens; on exit it only turns off what it turned on.

## Wi-Fi (independent module)

**Wi-Fi** tab: local network optimizations that work on their own, without the NoLag route and without Mudfish.

- Turn off power save, fix on wake, larger network buffers, CAKE queue, IPv6, access point lock, preferred band and DNS.
- Streaming mode (turns the fixes on only during a stream) and a fix for stalled streams.
- **Apply safe optimizations** turns everything on at once; **Restore** puts back the system default.
- The tweaks survive sleep, reconnects and system updates (SteamOS and Bazzite). Uninstalling the plugin undoes everything.
- Nothing is sent to the internet. If the original WiFi Optimizer is installed, turn one of the two off.
- Module derived from WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): see `THIRD_PARTY_NOTICES.md`.

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
