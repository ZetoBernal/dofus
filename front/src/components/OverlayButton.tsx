"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { Quest } from "@/lib/guides";
import { travelCommand } from "./TravelChip";

// Estilos escritos a mano (no Tailwind): la ventana de Picture-in-Picture
// arranca con un document en blanco, sin las hojas de estilo de la página.
const OVERLAY_CSS = `
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, system-ui, sans-serif;
    background: #ffffff;
    color: #18181b;
    font-size: 13px;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0a0a0a; color: #f4f4f5; }
  }
  header {
    padding: 12px 14px 10px;
    background: linear-gradient(180deg, rgba(245,158,11,0.12), transparent);
    border-bottom: 1px solid rgba(120,120,120,0.15);
    position: sticky;
    top: 0;
    z-index: 1;
    backdrop-filter: blur(6px);
  }
  .brand {
    font-size: 10px; font-weight: 700; letter-spacing: 0.04em;
    text-transform: uppercase; color: #f59e0b; margin: 0 0 3px;
  }
  h1 { font-size: 14px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.01em; }
  .bar { height: 5px; border-radius: 999px; background: rgba(120,120,120,0.15); overflow: hidden; }
  .bar > div { height: 100%; background: linear-gradient(90deg, #f59e0b, #fbbf24); border-radius: 999px; transition: width 0.25s ease; }
  .meta { font-size: 11px; color: #71717a; margin-top: 5px; }
  .tabs { display: flex; gap: 4px; overflow-x: auto; margin-top: 10px; padding-bottom: 2px; scrollbar-width: none; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex-shrink: 0; border: none; border-radius: 999px; padding: 4px 10px;
    font-size: 10.5px; font-weight: 600; cursor: pointer;
    background: rgba(120,120,120,0.12); color: #71717a;
  }
  .tab:hover { background: rgba(120,120,120,0.22); }
  .tab.active { background: #f59e0b; color: #1c1917; }
  ul { list-style: none; margin: 0; padding: 10px; display: flex; flex-direction: column; gap: 6px; }
  li {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 9px; border-radius: 10px;
    border: 1px solid rgba(120,120,120,0.14);
    background: rgba(120,120,120,0.03);
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  li:hover { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.06); }
  .avatar {
    width: 24px; height: 24px; border-radius: 999px; flex-shrink: 0;
    object-fit: cover; background: rgba(120,120,120,0.15);
  }
  .avatar.placeholder { visibility: hidden; }
  input[type="checkbox"] {
    width: 16px; height: 16px; accent-color: #f59e0b; flex-shrink: 0; cursor: pointer;
  }
  span.name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
  button.travel {
    flex-shrink: 0; font-family: ui-monospace, "SF Mono", monospace; font-size: 10px;
    background: rgba(120,120,120,0.12); border: none; border-radius: 999px;
    padding: 4px 8px; cursor: pointer; color: inherit;
  }
  button.travel:hover { background: #f59e0b; color: #1c1917; }
  p.empty { text-align: center; color: #71717a; padding: 32px 16px; font-size: 12px; line-height: 1.5; }
`;

function OverlayContent({
  guideName,
  quests,
  completed,
  onToggle,
  rangos,
  rango,
  onRangoChange,
}: {
  guideName: string;
  quests: Quest[];
  completed: Set<string>;
  onToggle: (mision: string) => void;
  rangos?: string[];
  rango?: string | null;
  onRangoChange?: (rango: string) => void;
}) {
  const pendientes = quests.filter((q) => !completed.has(q.mision));
  const done = quests.length - pendientes.length;
  const pct = quests.length > 0 ? Math.round((done / quests.length) * 100) : 0;

  async function copiar(coordenadas: string) {
    try {
      await navigator.clipboard.writeText(travelCommand(coordenadas));
    } catch {
      // sin permiso de portapapeles en esta ventana: no rompemos nada
    }
  }

  return (
    <>
      <style>{OVERLAY_CSS}</style>
      <header>
        <p className="brand">DofusGuías</p>
        <h1>{guideName}</h1>
        <div className="bar">
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="meta">
          {done} / {quests.length} completadas · {pct}%
        </p>
        {rangos && rangos.length > 1 && onRangoChange && (
          <div className="tabs">
            {rangos.map((r) => (
              <button
                key={r}
                type="button"
                className={`tab${r === rango ? " active" : ""}`}
                onClick={() => onRangoChange(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </header>
      {pendientes.length === 0 ? (
        <p className="empty">¡Todas las misiones visibles están completas! 🎉</p>
      ) : (
        <ul>
          {pendientes.map((q) => (
            <li key={q.mision}>
              <input
                type="checkbox"
                checked={false}
                onChange={() => onToggle(q.mision)}
              />
              {q.pnj ? (
                // eslint-disable-next-line @next/next/no-img-element -- se renderiza en un document aparte (ventana PiP), next/image no aplica ahí
                <img className="avatar" src={q.pnj.img} alt="" />
              ) : (
                <span className="avatar placeholder" />
              )}
              <span className="name" title={q.mision}>
                {q.mision}
              </span>
              {q.coordenadas && (
                <button
                  type="button"
                  className="travel"
                  onClick={() => copiar(q.coordenadas!)}
                >
                  {travelCommand(q.coordenadas)}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

interface PipWindow extends Window {
  document: Document;
}

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options: { width: number; height: number }) => Promise<PipWindow>;
      window: PipWindow | null;
    };
  }
}

export function OverlayButton({
  guideName,
  quests,
  completed,
  onToggle,
  rangos,
  rango,
  onRangoChange,
}: {
  guideName: string;
  quests: Quest[];
  completed: Set<string>;
  onToggle: (mision: string) => void;
  rangos?: string[];
  rango?: string | null;
  onRangoChange?: (rango: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [pipWindow, setPipWindow] = useState<PipWindow | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- feature detection client-only, no hay forma de saberlo en el render de servidor
    setSupported(typeof window !== "undefined" && "documentPictureInPicture" in window);
  }, []);

  async function abrir() {
    if (!window.documentPictureInPicture) return;
    try {
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 360,
        height: 560,
      });
      pip.addEventListener("pagehide", () => setPipWindow(null));
      setPipWindow(pip);
    } catch {
      // el navegador rechazó el pedido (sin gesto de usuario reciente, ya
      // hay una ventana abierta, etc.) — no rompemos la UI por esto
    }
  }

  function cerrar() {
    pipWindow?.close();
    setPipWindow(null);
  }

  if (!supported) return null;

  return (
    <>
      <button
        type="button"
        onClick={pipWindow ? cerrar : abrir}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:border-amber-300 hover:text-amber-700 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer"
      >
        {pipWindow ? "Cerrar overlay" : "🗗 Modo overlay"}
      </button>

      {pipWindow &&
        createPortal(
          <OverlayContent
            guideName={guideName}
            quests={quests}
            completed={completed}
            onToggle={onToggle}
            rangos={rangos}
            rango={rango}
            onRangoChange={onRangoChange}
          />,
          pipWindow.document.body
        )}
    </>
  );
}
