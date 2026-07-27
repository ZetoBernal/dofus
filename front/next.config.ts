import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Todo lo que el navegador pega a /backend/* se reenvía server-side al
  // backend NestJS. Así la cookie de sesión que este pone queda same-origin
  // (el browser la ve como propia de este host) sin necesitar CORS ni
  // compartir el JWT secret entre front y back.
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
