import { SYSTEMS, type SystemId } from "./data";

/** Linear map from a data domain to a pixel range. */
export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

export const SYSTEM_COLOR: Record<SystemId, string> = {
  gpt5: "var(--p-ink)",
  proposed: "var(--p-accent)",
  routellm: "var(--p-violet)",
  avengers: "var(--p-coral)",
};

/** Where a system sits in Fig. 3's viewBox (640 × 360), unzoomed — must
 *  match the scales in TradeoffFig. */
export function tradeoffPoint(id: SystemId): [number, number] {
  const s = SYSTEMS.find((v) => v.id === id)!;
  return [scale(-1, 45, 56, 620)(s.costRed), scale(-11, 1, 316, 16)(s.dAcc)];
}
