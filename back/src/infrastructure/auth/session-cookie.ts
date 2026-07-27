import { CookieOptions } from "express";
import { SESSION_DURATION_SECONDS } from "./jose-token.service";

export const SESSION_COOKIE = "dofus_admin_session";

export const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS * 1000,
};
