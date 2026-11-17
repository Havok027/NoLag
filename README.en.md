# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar devices running SteamOS or Bazzite) that lowers latency and steadies your network: Wi-Fi tuning and per-game routing with Mudfish. The two modules work separately.

## Tabs

- **Dashboard:** the live ping and jitter chart on top, which measures nonstop over the normal connection ("Without Mudfish", no credits used) and, with Mudfish on, also through the tunnel ("With Mudfish") to show the real gain, plus the **Game-only mode (credits protected)** badge when there is no full VPN. Then the **Mudfish** button (green when active), the Connection table and, near the end, the **Optimize Wi-Fi** button.
- **Wi-Fi:** local network tuning (below).
- **Mudfish:** guided 3-step flow (install, sign in on the panel, turn on) with automatic session detection (a passive "Account connected" / "Waiting for WebUI sign-in" indicator, no manual button), **Auto Selection** (on by default), **Multi-Path** (off), a button to open `http://127.0.0.1:8282`, an optional account (username and password, kept on this device only) and Advanced options (panel port, reinstall, reset session, route, ping, logs).
- **Conf:** turn on when a game opens (off by default), keep on after restart (off by default), per-game profiles with Wi-Fi and Mudfish switches, language (PT, EN, ES) and diagnostics.

## Mudfish: first use (only once)

1. Open the panel (`http://127.0.0.1:8282`) and sign in.
2. Pick **Basic** or **Multi-Path** mode.
3. Add by hand the games you want to optimize, checking the **Auto / South America** region.

This setup is done only once and is saved in your Mudfish account cloud. After that, the plugin only starts and stops the service and the equipped games follow by IP range.

## Wi-Fi and Mudfish are isolated

Wi-Fi tweaks are **never** undone when a game closes, when the console boots or when Mudfish turns off: only the button (or the Wi-Fi tab) restores them. The start-off and stop-on-game-exit rules apply **only** to the Mudfish service.

## Mudfish local API

The plugin reads (GET) the panel status: the session comes from the Mudfish client itself (`isSignedIn`, no JWT), **Full VPN is locked off** (if the panel turns it on, the service is stopped to protect credits) and the node latency measurement (`/do/rtt/*`) is followed until it is ready. Mudfish's `msk` interface is recognized when measuring. Commands that change state (Auto Selection and items) are not sent yet: Conf > Diagnostics captures, read-only, the context of those calls into `mudfish-api.json` so they can be verified before being wired. Until then, Auto Selection and Multi-Path are saved and the screen tells you when you must turn them on in the panel. Auto-login with the optional account also depends on that capture.

## Mudfish core update

NoLag checks Mudfish's official releases page (at most every 6 hours) and shows a notice on the Dashboard and the Mudfish tab when a new core is available. The **Update** button downloads that version's installer, replaces the binary and restarts the service if it was on. The check only informs: nothing is installed without your tap.

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
- **Apply safe optimizations** turns everything on at once; **Restore default** turns the network tweaks off and keeps **Fix on wake** on.
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
