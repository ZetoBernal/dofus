export abstract class PasswordHasher {
  abstract compare(plain: string, hash: string): Promise<boolean>;
}
