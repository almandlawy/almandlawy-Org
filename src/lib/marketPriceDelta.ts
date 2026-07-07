/**
 * Session spot baseline — indicative % change vs prior desk reference (not financial advice).
 */

const BASELINE_KEY = "pgr_market_spot_baseline";
const BASELINE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface SpotBaseline {
  goldUsdOz: number;
  silverUsdOz: number;
  capturedAt: string;
}

export interface MetalDelta {
  pct: number;
  direction: "up" | "down" | "flat";
}

export interface SpotDeltas {
  gold: MetalDelta | null;
  silver: MetalDelta | null;
}

function readBaseline(): SpotBaseline | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BASELINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotBaseline;
  } catch {
    return null;
  }
}

function writeBaseline(baseline: SpotBaseline): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BASELINE_KEY, JSON.stringify(baseline));
  } catch {
    /* ignore */
  }
}

function computeDelta(current: number, baseline: number): MetalDelta | null {
  if (!baseline || baseline <= 0 || !Number.isFinite(current)) return null;
  const pct = ((current - baseline) / baseline) * 100;
  if (!Number.isFinite(pct) || Math.abs(pct) < 0.005) {
    return { pct: 0, direction: "flat" };
  }
  return {
    pct,
    direction: pct > 0 ? "up" : "down",
  };
}

/** Compare current USD spot oz to session baseline; refresh baseline after 24h. */
export function getSpotDeltas(
  goldUsdOz?: number | null,
  silverUsdOz?: number | null
): SpotDeltas {
  const gold = goldUsdOz ?? null;
  const silver = silverUsdOz ?? null;

  if (gold == null && silver == null) {
    return { gold: null, silver: null };
  }

  const now = Date.now();
  let baseline = readBaseline();

  if (
    !baseline ||
    now - new Date(baseline.capturedAt).getTime() > BASELINE_MAX_AGE_MS
  ) {
    if (gold != null && silver != null) {
      writeBaseline({
        goldUsdOz: gold,
        silverUsdOz: silver,
        capturedAt: new Date().toISOString(),
      });
    }
    return { gold: null, silver: null };
  }

  return {
    gold: gold != null ? computeDelta(gold, baseline.goldUsdOz) : null,
    silver: silver != null ? computeDelta(silver, baseline.silverUsdOz) : null,
  };
}

export function formatDeltaPct(pct: number, lang: "en" | "ar"): string {
  const sign = pct > 0 ? "+" : "";
  const value = `${sign}${pct.toFixed(2)}%`;
  return lang === "ar" ? value : value;
}
