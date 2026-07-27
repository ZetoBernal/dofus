import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Injectable } from "@nestjs/common";
import { FileStorage, StoredFile } from "../../domain/uploads/file-storage";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "steps");

@Injectable()
export class LocalFileStorage extends FileStorage {
  async save(file: StoredFile): Promise<string> {
    const ext = file.mimeType === "image/jpeg" ? "jpg" : file.mimeType.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);

    return `/uploads/steps/${filename}`;
  }
}
