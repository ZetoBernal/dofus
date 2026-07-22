"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
      >
        <h1 className="text-lg font-semibold mb-1">Panel de admin</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          DofusGuías
        </p>

        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Usuario
        </label>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full mb-4 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
        />

        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
          Contraseña
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full mb-4 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
        />

        {state?.error && (
          <p className="text-sm text-red-500 mb-4">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-amber-400 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
