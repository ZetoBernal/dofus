import { Injectable } from "@nestjs/common";
import { SignJWT, jwtVerify } from "jose";
import { TokenService } from "../../domain/auth/token.service";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 días

@Injectable()
export class JoseTokenService extends TokenService {
  private getSecretKey() {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error("Falta SESSION_SECRET en back/.env — corré: openssl rand -base64 32");
    }
    return new TextEncoder().encode(secret);
  }

  sign(subject: string): Promise<string> {
    return new SignJWT({ sub: subject })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
      .sign(this.getSecretKey());
  }

  async verify(token: string): Promise<boolean> {
    try {
      await jwtVerify(token, this.getSecretKey());
      return true;
    } catch {
      return false;
    }
  }
}

export { SESSION_DURATION_SECONDS };
