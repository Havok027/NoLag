/**
 * v0.17.1: nome real do jogo no Steam. O backend só enxerga o nome do processo (ex.: "Main"); o cliente Steam conhece o título.
 * Melhor esforço: sem a API interna do Steam devolve "" e o nome do backend continua valendo.
 */
export interface AppStoreLike {
  GetAppOverviewByAppID?: (appid: number) => { display_name?: string } | null | undefined;
}

export function steamGameName(appid: string, store?: AppStoreLike): string {
  try {
    const s = store ?? (window as unknown as { appStore?: AppStoreLike }).appStore;
    const n = s?.GetAppOverviewByAppID?.(Number(appid))?.display_name;
    return typeof n === "string" ? n.trim() : "";
  } catch {
    return "";
  }
}
