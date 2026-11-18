# NoLag

[Português](README.md) | **English** | [Español](README.es.md)

Decky Loader plugin (Steam Deck, Legion Go and similar devices running SteamOS or Bazzite) that helps lower latency and steady your network. Two independent modules: **Wi-Fi** (local network tweaks) and **Mudfish** (install and service, with quick access to its web panel).

## How NoLag uses Mudfish

NoLag **does not configure routes**. It handles the basics and leaves the rest to Mudfish's own web panel (`http://127.0.0.1:8282`):

- **The plugin does:** installs Mudfish in a persistent folder, turns the service on and off, shows the current ping and opens the panel with one tap.
- **The Mudfish panel does:** login, items/games, region, node selection, Multi-Path and every route.

The web panel does not render well inside the QAM in Game Mode, so **Open Mudfish panel** opens it in the Steam browser.

## Tabs

- **Dash:** current ping as a ring and chart, with jitter and packet loss. With Mudfish on and the tunnel answering, the reading comes from the tunnel; otherwise from the normal connection (no credits used). Then: the **Mudfish** button (green when active), **Open Mudfish panel**, the credits warning, the Connection table and the **Optimize Wi-Fi** button.
- **Wi-Fi:** quick actions, optimizations, streaming and advanced tweaks (below).
- **Mudfish:** status in 3 steps (install, log in on the panel, service on), service switch, **Open Mudfish panel**, first-use guide, credits warning, core update (no login fields: you log in only on the web panel) and advanced options (port, current route, ping target, reinstall, redo login, logs).
- **Conf:** enable on game launch (off by default), keep on after restart (off by default), per-game profiles with Wi-Fi and Mudfish switches, language (PT, EN, ES) and diagnostics.

## Mudfish: first use (once)

1. Turn Mudfish on and tap **Open Mudfish panel**. Log in.
2. In the panel, add the game and pick the region (**Auto / South America**), node selection and mode (**Basic** or **Multi-Path**).
3. Go back to the game.

This setup is done once and saved in your Mudfish account's cloud. NoLag does not change these options: afterwards it only turns the service on and off (by hand or, if you enable it in Conf, when a game opens and closes).

## Mudfish: credit protection

Mudfish bills per traffic. So NoLag **always starts with Mudfish off**, at boot and when a game opens, unless you enable the option in Conf. When any game closes, Mudfish is stopped right away. Turning it on by hand never enables keep-on.

- **Never download anything with Mudfish on** (games, updates, files): the traffic is billed.
- Prefer the **game item** in the Mudfish panel. **Full VPN** is allowed (for games with no item for your region, point it at the closest node, e.g. São Paulo), but it routes all system traffic: keep background downloads off. The `?` button in the Mudfish tab explains when to use each.
- **Multi-Path** (set in the panel) improves stability and jitter but uses more credits.

## Mudfish technical notes

- Install follows the official SteamOS guide (`sh` installer, `mudrun-headless` service without flags) in a persistent folder bound to `/opt/mudfish`, and shows the exact reason when something fails.
- The plugin only **reads** the local API (status, session, telemetry) and uses the official start and stop routes. It detects on its own whether you have logged in on the panel.
- **Dynamic version:** the installed version always comes from the official releases page (if it does not answer, a fresh install uses the 6.6.4 fallback). The Mudfish tab shows the installed and the latest detected versions.
- **Uninstall Mudfish:** button in the Mudfish tab, with confirmation. Stops Mudfish processes, deletes `/opt/mudfish`, the persistent folder, logs and leftovers, and clears the login state and "Keep on" saved in the plugin. Your Mudfish cloud account is not affected.
- **Core update:** NoLag checks the official versions page (at most every 6 hours) and warns when a newer core exists. **Update** downloads it, swaps the binary and restarts the service if it was on. Nothing is installed without your tap.

## Wi-Fi (independent module)

**Wi-Fi** tab: local network tweaks that work with Mudfish on or off. On-screen order: quick actions, optimizations, streaming, advanced.

- **Quick actions:** **Apply safe optimizations** turns everything on at once; **Restore default** turns the network tweaks off and keeps **Fix on wake** on.
- **Optimizations:** disable power saving, fix on wake, larger network buffers and CAKE queue.
- **Streaming:** streaming mode (tweaks on only during a stream) and frozen-stream fix.
- **Advanced:** IPv6, access point lock, preferred band and DNS.
- The tweaks are **never** undone when a game closes, the console boots or Mudfish turns off: only the button (or the Wi-Fi tab) restores them. They survive suspend, reconnection and system updates (SteamOS and Bazzite). Uninstalling the plugin undoes everything.
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
