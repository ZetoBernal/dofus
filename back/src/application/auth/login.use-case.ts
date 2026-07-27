import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AdminCredentialsProvider } from "../../domain/auth/admin-credentials.provider";
import { PasswordHasher } from "../../domain/auth/password-hasher";
import { TokenService } from "../../domain/auth/token.service";

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly credentials: AdminCredentialsProvider,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(username: string, password: string): Promise<string> {
    const expected = this.credentials.get();
    const validUsername = username === expected.username;
    const validPassword = await this.passwordHasher.compare(password, expected.passwordHash);

    if (!validUsername || !validPassword) {
      throw new UnauthorizedException("Usuario o contraseña incorrectos.");
    }

    return this.tokenService.sign(username);
  }
}
