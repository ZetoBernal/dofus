import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "dofus_admin_session";

// Solo chequea que la cookie exista, no la firma del JWT — el back es dueño
// de la autenticación ahora y es quien realmente valida el token en cada
// escritura (ver back/src/infrastructure/http/guards/session-auth.guard.ts).
// Esto es nada más un gate de UX para no mostrar el shell del admin a un
// visitante sin sesión; una cookie vencida o falsa no permite mutar nada,
// el guard del back la rechaza igual.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
