import { BadRequestException, Injectable } from "@nestjs/common";
import { FileStorage, StoredFile } from "../../domain/uploads/file-storage";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

@Injectable()
export class UploadStepImageUseCase {
  constructor(private readonly storage: FileStorage) {}

  execute(file: StoredFile): Promise<string> {
    if (!ALLOWED_TYPES.has(file.mimeType)) {
      throw new BadRequestException("Formato no soportado (usá PNG, JPG, WEBP o GIF).");
    }
    if (file.sizeBytes > MAX_UPLOAD_BYTES) {
      throw new BadRequestException("La imagen pesa más de 5 MB.");
    }
    return this.storage.save(file);
  }
}
