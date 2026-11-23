/** Lógica pura do destaque "Melhor conexão" do Painel (sem imports: testável isoladamente). */
export interface BestSample {
  base: { avg: number | null; jitter: number | null; loss: number | null } | null;
  tunnel: { avg: number | null; jitter: number | null; loss: number | null } | null;
}

export type BestSide = "with" | "without";
export interface BestResult {
  /** "waiting" = sem dados para comparar (Mudfish desligado, sem túnel medido ou poucas amostras). */
  state: "waiting" | "tie" | "winner";
  side: BestSide | null;
  withAvg: number | null;
  withoutAvg: number | null;
}

/** Mínimo de amostras válidas em cada lado para declarar um vencedor. */
export const MIN_SAMPLES = 3;
/** Diferença de ping (ms) abaixo da qual a comparação vai para o desempate. */
export const PING_TIE_MS = 3;

const nums = (xs: (number | null | undefined)[]): number[] => xs.filter((v): v is number => typeof v === "number");
const mean = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export function bestConnection(samples: BestSample[]): BestResult {
  const wPing = nums(samples.map((s) => s.tunnel?.avg));
  const oPing = nums(samples.map((s) => s.base?.avg));
  const withAvg = mean(wPing);
  const withoutAvg = mean(oPing);
  const waiting: BestResult = { state: "waiting", side: null, withAvg, withoutAvg };
  if (wPing.length < MIN_SAMPLES || oPing.length < MIN_SAMPLES || withAvg === null || withoutAvg === null) return waiting;

  const diff = withAvg - withoutAvg;
  if (Math.abs(diff) >= PING_TIE_MS) return { state: "winner", side: diff < 0 ? "with" : "without", withAvg, withoutAvg };

  // Empate muito próximo no ping: desempata por jitter e depois por perda (menor é melhor).
  for (const key of ["jitter", "loss"] as const) {
    const w = mean(nums(samples.map((s) => s.tunnel?.[key])));
    const o = mean(nums(samples.map((s) => s.base?.[key])));
    if (w !== null && o !== null && w !== o) return { state: "winner", side: w < o ? "with" : "without", withAvg, withoutAvg };
  }
  return { state: "tie", side: null, withAvg, withoutAvg };
}

/** Amostra do histórico do backend: `b` = sem Mudfish, `w` = com; cada pacote é [ping, jitter, perda]. `t` em segundos. */
export interface HistLike {
  t: number;
  b: (number | null)[] | null;
  w: (number | null)[] | null;
}

/** Janela da comparação: os 30 min do histórico. */
export const BEST_WINDOW_S = 1800;

const pack = (p: (number | null)[] | null) => (p ? { avg: p[0] ?? null, jitter: p[1] ?? null, loss: p[2] ?? null } : null);

/** Converte o histórico (só amostras dentro da janela de 30 min até `now`) para o formato da comparação. */
export function fromHistory(samples: HistLike[], now: number, window: number = BEST_WINDOW_S): BestSample[] {
  return samples.filter((s) => s.t >= now - window && s.t <= now + 60).map((s) => ({ base: pack(s.b), tunnel: pack(s.w) }));
}
