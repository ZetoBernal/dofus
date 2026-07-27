import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { TokenService } from "../../../domain/auth/token.service";
import { SESSION_COOKIE } from "../../auth/session-cookie";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[SESSION_COOKIE];
    const valid = token ? await this.tokenService.verify(token) : false;
    if (!valid) {
      throw new UnauthorizedException("Sesión inválida o expirada.");
    }
    return true;
  }
}
