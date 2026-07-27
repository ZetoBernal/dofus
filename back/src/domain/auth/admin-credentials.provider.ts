export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export abstract class AdminCredentialsProvider {
  abstract get(): AdminCredentials;
}
