import { PointerEvent, useRef } from "react";
import type { HistSample } from "./historyApi";

export const COLOR_WITHOUT = "#9aa0a6";
export const COLOR_WITH = "#3ddc84";

export interface HistMetric {
  index: 0 | 1 | 2; // 0 ping, 1 jitter, 2 perda
  title: string;
  unit: string;
  decimals: number;
  floor: number; // menor valor máximo do eixo Y
}

export type Side = "b" | "w";

export function valueOf(s: HistSample | null | undefined, side: Side, index: number): number | null {
  const pack = s ? s[side] : null;
  const v = pack ? pack[index] : null;
  return typeof v === "number" ? v : null;
}

/** Amostra mais próxima do instante `t` (ou null sem amostras). */
export function nearestSample(samples: HistSample[], t: number): HistSample | null {
  let best: HistSample | null = null;
  for (const s of samples) {
    if (best === null || Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
  }
  return best;
}

function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

const W = 1000;
const H = 150;
const L = 46;
const R = 14;
const T = 24;
const B = 20;

interface Props {
  samples: HistSample[];
  now: number;
  window: number;
  interval: number;
  metric: HistMetric;
  withLabel: string;
  withoutLabel: string;
  nowLabel: string;
  cursorT: number | null;
  onCursor: (t: number | null) => void;
}

function fmt(v: number | null, m: HistMetric): string {
  return v === null ? "—" : `${v.toFixed(m.decimals)} ${m.unit}`;
}

export function HistoryChart(p: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const t0 = p.now - p.window;
  const xOf = (t: number) => L + ((t - t0) / p.window) * (W - L - R);
  const tOf = (x: number) => t0 + ((x - L) / (W - L - R)) * p.window;
  const idx = p.metric.index;

  const all: number[] = [];
  for (const s of p.samples) {
    for (const side of ["b", "w"] as Side[]) {
      const v = valueOf(s, side, idx);
      if (v !== null) all.push(v);
    }
  }
  const yMax = niceMax(Math.max(p.metric.floor, (all.length ? Math.max(...all) : 0) * 1.15));
  const yOf = (v: number) => T + (1 - Math.min(v, yMax) / yMax) * (H - T - B);

  // Linhas contínuas por lado; um buraco maior que 3 intervalos (ou valor ausente) quebra a linha.
  const build = (side: Side) => {
    const segs: string[] = [];
    const dots: { x: number; y: number }[] = [];
    let cur: { x: number; y: number }[] = [];
    let prevT = -Infinity;
    const flush = () => {
      if (cur.length === 1) dots.push(cur[0]);
      else if (cur.length > 1) segs.push(cur.map((q, i) => `${i === 0 ? "M" : "L"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" "));
      cur = [];
    };
    for (const s of p.samples) {
      const v = valueOf(s, side, idx);
      if (v === null || s.t - prevT > p.interval * 3) flush();
      if (v !== null) {
        cur.push({ x: xOf(s.t), y: yOf(v) });
        prevT = s.t;
      }
    }
    flush();
    return { segs, dots };
  };
  const without = build("b");
  const withM = build("w");

  const avgOf = (side: Side): number | null => {
    const vs = p.samples.map((s) => valueOf(s, side, idx)).filter((v): v is number => v !== null);
    return vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null;
  };
  const aO = avgOf("b");
  const aW = avgOf("w");
  const best: Side | null = aO !== null && aW !== null && aO !== aW ? (aW < aO ? "w" : "b") : null;

  const cur = p.cursorT !== null ? nearestSample(p.samples, p.cursorT) : null;
  const curX = cur ? xOf(cur.t) : null;

  const move = (e: PointerEvent<SVGSVGElement>) => {
    const el = ref.current;
    if (!el || !p.samples.length) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    const s = nearestSample(p.samples, tOf(((e.clientX - r.left) / r.width) * W));
    if (s) p.onCursor(s.t);
  };

  const yLabel = (v: number) => `${+v.toFixed(v < 10 ? 1 : 0)}`;
  const ticks = [0, 10, 20, 30].filter((m) => m * 60 <= p.window);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      style={{ display: "block", touchAction: "none", userSelect: "none", cursor: "crosshair" }}
      onPointerDown={(e) => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* sem captura de ponteiro, o toque ainda funciona */
        }
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0 || e.pointerType === "mouse") move(e);
      }}
    >
      <text x={L} y={15} fontSize={13} fontWeight={700} fill="rgba(255,255,255,0.92)">
        {p.metric.title}
      </text>
      <text x={W - R} y={15} fontSize={12} textAnchor="end">
        <tspan fill={COLOR_WITHOUT}>{`${p.withoutLabel} ${fmt(aO, p.metric)}${best === "b" ? " ✓" : ""}`}</tspan>
        <tspan dx={16} fill={COLOR_WITH}>{`${p.withLabel} ${fmt(aW, p.metric)}${best === "w" ? " ✓" : ""}`}</tspan>
      </text>
      {[0, 0.5, 1].map((f) => {
        const y = T + (1 - f) * (H - T - B);
        return (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth={1} />
            <text x={L - 6} y={y + 4} fontSize={11} textAnchor="end" fill="rgba(255,255,255,0.6)">
              {yLabel(yMax * f)}
            </text>
          </g>
        );
      })}
      {ticks.map((m) => (
        <text key={m} x={xOf(p.now - m * 60)} y={H - 4} fontSize={11} textAnchor={m === 0 ? "end" : "middle"} fill="rgba(255,255,255,0.6)">
          {m === 0 ? p.nowLabel : `-${m}m`}
        </text>
      ))}
      {without.segs.map((d, i) => (
        <path key={"o" + i} d={d} fill="none" stroke={COLOR_WITHOUT} strokeWidth={2} strokeDasharray="6 4" strokeLinejoin="round" />
      ))}
      {without.dots.map((q, i) => (
        <circle key={"od" + i} cx={q.x} cy={q.y} r={2.5} fill={COLOR_WITHOUT} />
      ))}
      {withM.segs.map((d, i) => (
        <path key={"w" + i} d={d} fill="none" stroke={COLOR_WITH} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
      {withM.dots.map((q, i) => (
        <circle key={"wd" + i} cx={q.x} cy={q.y} r={2.5} fill={COLOR_WITH} />
      ))}
      {cur && curX !== null && (
        <g pointerEvents="none">
          <line x1={curX} x2={curX} y1={T} y2={H - B} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
          {(["b", "w"] as Side[]).map((side) => {
            const v = valueOf(cur, side, idx);
            return v === null ? null : (
              <circle key={side} cx={curX} cy={yOf(v)} r={5} fill={side === "w" ? COLOR_WITH : COLOR_WITHOUT} stroke="#0e1117" strokeWidth={2} />
            );
          })}
        </g>
      )}
    </svg>
  );
}
