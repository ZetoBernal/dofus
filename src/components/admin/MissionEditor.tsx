"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { StepInput } from "@/lib/overrides";
import { saveMission, deleteMission, uploadStepImage } from "@/app/admin/[slug]/[mision]/actions";

interface EditableStep extends StepInput {
  key: string;
  uploading: boolean;
}

function newStep(): EditableStep {
  return { key: crypto.randomUUID(), texto: "", imagen: null, uploading: false };
}

export function MissionEditor({
  slug,
  mision,
  link,
  initialNombreEs,
  initialPasos,
}: {
  slug: string;
  mision: string;
  link: string;
  initialNombreEs: string | null;
  initialPasos: StepInput[];
}) {
  const router = useRouter();
  const [nombreEs, setNombreEs] = useState(initialNombreEs ?? "");
  const [pasos, setPasos] = useState<EditableStep[]>(
    initialPasos.length > 0
      ? initialPasos.map((p) => ({ ...p, key: crypto.randomUUID(), uploading: false }))
      : [newStep()]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function updateStep(key: string, patch: Partial<EditableStep>) {
    setPasos((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function addStep() {
    setPasos((prev) => [...prev, newStep()]);
  }

  function removeStep(key: string) {
    setPasos((prev) => (prev.length > 1 ? prev.filter((p) => p.key !== key) : prev));
  }

  function moveStep(key: string, dir: -1 | 1) {
    setPasos((prev) => {
      const i = prev.findIndex((p) => p.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function handleFile(key: string, file: File) {
    updateStep(key, { uploading: true });
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadStepImage(formData);
    if ("error" in result) {
      setMessage(result.error);
      updateStep(key, { uploading: false });
      return;
    }
    updateStep(key, { imagen: result.path, uploading: false });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    await saveMission(slug, mision, {
      nombreEs: nombreEs.trim() || null,
      pasos: pasos.map(({ texto, imagen }) => ({ texto, imagen })),
    });
    setSaving(false);
    setMessage("Guardado.");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Borrar toda la traducción de esta misión?")) return;
    setSaving(true);
    await deleteMission(slug, mision);
    setNombreEs("");
    setPasos([newStep()]);
    setSaving(false);
    setMessage("Traducción borrada.");
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
        <p className="text-xs text-zinc-400 mb-1">Nombre original (francés)</p>
        <p className="font-medium mb-2">{mision}</p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-600 dark:text-amber-500 hover:underline"
        >
          Ver guía en francés →
        </a>
      </div>

      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        Nombre en español
      </label>
      <input
        value={nombreEs}
        onChange={(e) => setNombreEs(e.target.value)}
        placeholder={mision}
        className="w-full mb-6 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
      />

      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
        Pasos de la guía
      </p>
      <div className="flex flex-col gap-3 mb-4">
        {pasos.map((paso, i) => (
          <div key={paso.key} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400">Paso {i + 1}</span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <button type="button" onClick={() => moveStep(paso.key, -1)} disabled={i === 0} className="hover:text-amber-600 disabled:opacity-30 cursor-pointer disabled:cursor-default">
                  ↑
                </button>
                <button type="button" onClick={() => moveStep(paso.key, 1)} disabled={i === pasos.length - 1} className="hover:text-amber-600 disabled:opacity-30 cursor-pointer disabled:cursor-default">
                  ↓
                </button>
                <button type="button" onClick={() => removeStep(paso.key)} className="hover:text-red-500 cursor-pointer">
                  Eliminar
                </button>
              </div>
            </div>

            <textarea
              value={paso.texto}
              onChange={(e) => updateStep(paso.key, { texto: e.target.value })}
              placeholder="Explicá este paso..."
              rows={3}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900 mb-2"
            />

            {paso.imagen ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview de imagen subida por el admin, ruta local */}
                <img src={paso.imagen} alt="" className="h-16 rounded-md border border-zinc-200 dark:border-zinc-800" />
                <button
                  type="button"
                  onClick={() => updateStep(paso.key, { imagen: null })}
                  className="text-xs text-zinc-400 hover:text-red-500 cursor-pointer"
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={(el) => {
                    fileInputs.current[paso.key] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(paso.key, file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputs.current[paso.key]?.click()}
                  disabled={paso.uploading}
                  className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 cursor-pointer disabled:opacity-50"
                >
                  {paso.uploading ? "Subiendo..." : "+ Agregar imagen"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addStep}
        className="text-sm text-amber-600 dark:text-amber-500 hover:underline mb-8 cursor-pointer"
      >
        + Agregar paso
      </button>

      <div className="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="text-sm text-zinc-400 hover:text-red-500 cursor-pointer"
        >
          Borrar traducción
        </button>
        {message && <span className="text-sm text-zinc-500 dark:text-zinc-400">{message}</span>}
      </div>
    </div>
  );
}
