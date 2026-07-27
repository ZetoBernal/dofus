export abstract class TokenService {
  abstract sign(subject: string): Promise<string>;
  abstract verify(token: string): Promise<boolean>;
}
