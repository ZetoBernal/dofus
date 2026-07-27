import { Injectable } from "@nestjs/common";
import bcrypt from "bcryptjs";
import { PasswordHasher } from "../../domain/auth/password-hasher";

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
