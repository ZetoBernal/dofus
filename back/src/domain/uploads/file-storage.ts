export interface StoredFile {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

export abstract class FileStorage {
  /** Guarda el archivo y devuelve la ruta pública (servida por el backend) para leerlo. */
  abstract save(file: StoredFile): Promise<string>;
}
