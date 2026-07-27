"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";
const SESSION_COOKIE = "dofus_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días, igual que back/src/infrastructure/auth/jose-token.service.ts

export async function login(_prevState: { error: string } | null, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const body: { message?: string } | null = await res.json().catch(() => null);
    return { error: body?.message ?? "Usuario o contraseña incorrectos." };
  }

  // El back nos manda el JWT como Set-Cookie; lo reproducimos acá como
  // cookie propia del front porque esta llamada es servidor-a-servidor (el
  // navegador nunca la ve), a diferencia de las mutaciones del admin que sí
  // pasan por /backend/* y heredan la cookie automáticamente.
  const token = extractSessionToken(res);
  if (!token) {
    return { error: "El backend no configuró la sesión correctamente." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

function extractSessionToken(res: Response): string | null {
  const raw = res.headers.getSetCookie?.()[0] ?? res.headers.get("set-cookie");
  if (!raw) return null;
  const match = raw.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
