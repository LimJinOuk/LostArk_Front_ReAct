// Lightweight clone & JSON parse helpers used by the simulator.

export function safeClone<T>(v: T): T {
  try {
    // Prefer structuredClone when available (faster & supports more types).
    // Falls back to JSON clone for plain data objects.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sc = (globalThis as any)?.structuredClone;
    if (typeof sc === "function") return sc(v);
    return JSON.parse(JSON.stringify(v));
  } catch {
    return v;
  }
}

export function safeJsonParse<T = any>(raw: any): T | null {
  if (raw == null) return null;
  if (typeof raw !== "string") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

