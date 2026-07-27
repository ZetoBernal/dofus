/**
 * Espacio reservado para publicidad. No conecta a ninguna red de anuncios
 * real (eso requiere una cuenta propia del dueño del sitio, p.ej. AdSense) —
 * es solo el hueco visual + layout para que se pueda cablear después.
 */
export function AdSlot({ variant = "banner" }: { variant?: "banner" | "rectangle" }) {
  const size = variant === "banner" ? "h-24" : "h-40";

  return (
    <div
      className={`${size} w-full rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xs text-zinc-300 dark:text-zinc-700`}
      aria-hidden="true"
    >
      Espacio publicitario
    </div>
  );
}
