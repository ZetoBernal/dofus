const PREFIX = "dofus-progress:";

function key(slug: string): string {
  return `${PREFIX}${slug}`;
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadProgress(slug: string): Set<string> {
  if (!hasStorage()) return new Set();
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export function saveProgress(slug: string, completed: Set<string>): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key(slug), JSON.stringify([...completed]));
  } catch {
    // almacenamiento lleno o bloqueado: ignoramos, no es crítico
  }
}

export function progressCount(slug: string): number {
  return loadProgress(slug).size;
}
