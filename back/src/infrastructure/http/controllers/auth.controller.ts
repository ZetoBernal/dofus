import { Body, Controller, HttpCode, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { LoginUseCase } from "../../../application/auth/login.use-case";
import { LoginDto } from "../dto/login.dto";
import { SESSION_COOKIE, sessionCookieOptions } from "../../auth/session-cookie";

@Controller("auth")
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const token = await this.loginUseCase.execute(dto.username, dto.password);
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions);
    return { ok: true };
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: sessionCookieOptions.path });
    return { ok: true };
  }
}
