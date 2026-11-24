/**
 * v0.16.7: ao criar o atalho, tenta aplicar o layout de controle "Navegação Web" (melhor esforço, falhas ignoradas).
 * v0.16.6: abre o painel do Mudfish pelo Steam. O Decky roda como root e o navegador lançado por ele cai no sandbox (EPERM);
 * um atalho do Steam roda dentro da sessão de jogo do usuário, como qualquer atalho não-Steam.
 * Módulo sem dependências do Decky: as funções do Steam entram por `deps` (testável com um Steam falso).
 */
export interface PanelSpec {
  name?: string;
  exe?: string;
  start_dir?: string;
  launch_options?: string;
  sig?: string;
  saved?: { appid: number; sig: string } | null;
}

export interface SteamApps {
  AddShortcut(name: string, exe: string, startDir: string, launchOptions: string): Promise<number> | number;
  RemoveShortcut?(appid: number): unknown;
  SetShortcutName?(appid: number, name: string): unknown;
  SetShortcutLaunchOptions?(appid: number, options: string): unknown;
  RunGame(gameId: string, launchOptions: string, userId: number, source: number): unknown;
}

export interface PanelDeps {
  apps: SteamApps | undefined;
  /** SteamClient.Input (opcional): usado só para aplicar o layout de Navegação Web. */
  input?: Record<string, unknown> | undefined;
  /** gameid do Steam de um atalho já existente (null = o atalho não existe mais). */
  gameIdOf(appid: number): string | null;
  save(appid: number, sig: string): Promise<unknown>;
  wait(ms: number): Promise<void>;
}

export interface PanelResult {
  ok: boolean;
  error?: string;
}

export const WEB_BROWSER_TEMPLATE = "controller_neptune_web_browser.vdf";
const INPUT_METHODS = ["SetAppControllerConfiguration", "SetControllerMapping"];

/** Melhor esforço: aplica o template de Navegação Web ao atalho. Nunca lança, nunca espera, nunca avisa. */
export function applyWebBrowserLayout(input: Record<string, unknown> | undefined, appid: number): boolean {
  try {
    if (!input) return false;
    for (const name of INPUT_METHODS) {
      const fn = input[name];
      if (typeof fn !== "function") continue;
      try {
        const r = (fn as (...a: unknown[]) => unknown).call(input, appid, WEB_BROWSER_TEMPLATE);
        if (r && typeof (r as Promise<unknown>).catch === "function") (r as Promise<unknown>).catch(() => undefined);
        return true;
      } catch {
        /* tenta o próximo método */
      }
    }
  } catch {
    /* sem a API interna: segue sem o layout */
  }
  return false;
}

const READY_TRIES = 10;
const READY_MS = 300;

/** gameid de um atalho não-Steam a partir do appid: (appid << 32) | 0x02000000. */
export function shortcutGameId(appid: number): string {
  return (BigInt(appid) * BigInt(4294967296) + BigInt(33554432)).toString();
}

export async function launchPanelShortcut(spec: PanelSpec, deps: PanelDeps): Promise<PanelResult> {
  const apps = deps.apps;
  if (!apps || typeof apps.AddShortcut !== "function" || typeof apps.RunGame !== "function") return { ok: false, error: "steam_api_missing" };
  if (!spec.exe || !spec.sig) return { ok: false, error: "bad_spec" };
  const name = spec.name || "NoLag - Painel Mudfish";
  const options = spec.launch_options || "";

  let appid = 0;
  const saved = spec.saved;
  if (saved && saved.appid > 0) {
    if (saved.sig === spec.sig && deps.gameIdOf(saved.appid)) {
      appid = saved.appid; // atalho já criado e ainda existente: só reaproveita
    } else {
      try {
        apps.RemoveShortcut?.(saved.appid); // navegador trocado ou atalho velho: remove o antigo antes de criar outro
      } catch {
        /* já não existe */
      }
    }
  }

  if (!appid) {
    let created: unknown;
    try {
      created = await apps.AddShortcut(name, spec.exe, spec.start_dir || "/", options);
    } catch {
      return { ok: false, error: "add_shortcut_failed" };
    }
    if (typeof created !== "number" || !(created > 0)) return { ok: false, error: "add_shortcut_failed" };
    appid = created;
    try {
      apps.SetShortcutName?.(appid, name);
      apps.SetShortcutLaunchOptions?.(appid, options);
    } catch {
      /* algumas versões já aplicam tudo no AddShortcut */
    }
    applyWebBrowserLayout(deps.input, appid);
    try {
      await deps.save(appid, spec.sig);
    } catch {
      /* sem salvar, só recria na próxima vez */
    }
  }

  let gid = deps.gameIdOf(appid);
  for (let i = 0; !gid && i < READY_TRIES; i++) {
    await deps.wait(READY_MS);
    gid = deps.gameIdOf(appid);
  }
  if (!gid) gid = shortcutGameId(appid);
  try {
    await apps.RunGame(gid, "", -1, 100);
  } catch {
    return { ok: false, error: "run_failed" };
  }
  return { ok: true };
}
