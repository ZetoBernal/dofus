import { Injectable } from "@nestjs/common";
import { AdminCredentials, AdminCredentialsProvider } from "../../domain/auth/admin-credentials.provider";

@Injectable()
export class EnvAdminCredentialsProvider extends AdminCredentialsProvider {
  get(): AdminCredentials {
    const username = process.env.ADMIN_USERNAME;
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!username || !passwordHash) {
      throw new Error("Falta ADMIN_USERNAME o ADMIN_PASSWORD_HASH en back/.env");
    }
    return { username, passwordHash };
  }
}
