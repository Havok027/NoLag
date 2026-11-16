# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar devices running SteamOS or Bazzite) that lowers latency and steadies your network: Wi-Fi tuning and per-game routing with Mudfish. The two modules work separately.

## Tabs

- **Dashboard:** two quick switches (Wi-Fi and Mudfish), the live ping and jitter chart with and without Mudfish, and the Connection table.
- **Wi-Fi:** local network tuning (below).
- **Mudfish:** guided 3-step flow (install, sign in on the panel, turn on), **Auto Selection** (on by default), **Multi-Path** (off), a button to open the `http://127.0.0.1:8282` panel and Advanced options (route, ping before and after, logs).
- **Conf:** turn on when a game opens (off by default), keep on after restart (off by default), per-game profiles with Wi-Fi and Mudfish switches, language (PT, EN, ES) and diagnostics.

## Mudfish: credit protection

Mudfish bills by traffic, so NoLag **always starts with Mudfish off**, at boot and when a game opens, unless you enable the option in the Conf tab. When any game closes, Mudfish is stopped right away. Turning it on by hand never enables keep-on.

- **Never download anything while Mudfish is on** (games, updates, files): the traffic is billed.
- Use only per-game routing in the Mudfish panel. **Do not enable full-system VPN.** NoLag warns if system traffic seems to go through the tunnel.
- **Multi-Path** improves stability and jitter but uses more credits.
- The install follows the official SteamOS guide (installer run with `sh`, `mudrun-headless` service without flags, sign-in on the panel) in a persistent folder bound to `/opt/mudfish`, and shows the exact reason when something fails. Mudfish's local API is undocumented: Auto Selection and Multi-Path are saved and the app tells you when you must turn them on in the panel.

## Wi-Fi (independent module)

**Wi-Fi** tab: local network tuning that works on its own, without Mudfish.

- Turn off power saving, fix after wake, larger network buffers, CAKE queue, IPv6, access point lock, preferred band and DNS.
- Streaming mode (applies the tweaks only during a stream) and fix for stalled streams.
- **Apply safe optimizations** turns everything on at once; **Restore** brings back the system defaults.
- Tweaks survive suspend, reconnect and system updates (SteamOS and Bazzite). Uninstalling the plugin undoes everything.
- Sends nothing to the internet. If the original WiFi Optimizer is installed, turn one of the two off.
- Module derived from WiFi Optimizer 0.25.0 (Arcada Labs, BSD 3-Clause): see `THIRD_PARTY_NOTICES.md`.

## Languages

Português, English and Español (Conf > Language).

## Development

```
pnpm install
pnpm test
pnpm build
```
