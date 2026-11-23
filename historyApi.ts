import { callable } from "@decky/api";

/** [ping, jitter, perda]; cada posição pode ser null quando não foi medida. */
export type HistPack = (number | null)[];

/** Amostra salva pelo backend: `b` = sem Mudfish (conexão normal), `w` = com Mudfish (túnel). `t` em segundos (epoch). */
export interface HistSample {
  t: number;
  b: HistPack | null;
  w: HistPack | null;
}

export interface HistData {
  ok: boolean;
  error?: string;
  now: number;
  interval: number;
  window: number;
  samples: HistSample[];
}

export const historyGet = callable<[], HistData>("history_get");
