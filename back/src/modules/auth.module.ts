import { Module } from "@nestjs/common";
import { AuthController } from "../infrastructure/http/controllers/auth.controller";
import { SessionAuthGuard } from "../infrastructure/http/guards/session-auth.guard";
import { JoseTokenService } from "../infrastructure/auth/jose-token.service";
import { BcryptPasswordHasher } from "../infrastructure/auth/bcrypt-password-hasher";
import { EnvAdminCredentialsProvider } from "../infrastructure/auth/env-admin-credentials.provider";
import { TokenService } from "../domain/auth/token.service";
import { PasswordHasher } from "../domain/auth/password-hasher";
import { AdminCredentialsProvider } from "../domain/auth/admin-credentials.provider";
import { LoginUseCase } from "../application/auth/login.use-case";

@Module({
  controllers: [AuthController],
  providers: [
    { provide: TokenService, useClass: JoseTokenService },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: AdminCredentialsProvider, useClass: EnvAdminCredentialsProvider },
    LoginUseCase,
    SessionAuthGuard,
  ],
  exports: [TokenService, SessionAuthGuard],
})
export class AuthModule {}
