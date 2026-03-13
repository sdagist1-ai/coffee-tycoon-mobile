// ─── Local Storage Persistence ─────────────────────────────────
// Simple localStorage wrapper. Will upgrade to Capacitor SQLite later.

const STORAGE_KEY = "coffee_tycoon_save";

export function saveGameData(data: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("[storage] Game saved");
  } catch (e) {
    console.error("[storage] Failed to save:", e);
  }
}

export function loadGameData<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error("[storage] Failed to load:", e);
    return null;
  }
}

export function clearGameData(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log("[storage] Game data cleared");
}
