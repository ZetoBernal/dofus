"use server";

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { saveOverride, deleteOverride, type StepInput } from "@/lib/overrides";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "steps");
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export async function uploadStepImage(
  formData: FormData
): Promise<{ path: string } | { error: string }> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No se recibió ningún archivo." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Formato no soportado (usá PNG, JPG, WEBP o GIF)." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "La imagen pesa más de 5 MB." };
  }

  const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return { path: `/uploads/steps/${filename}` };
}

export async function saveMission(
  slug: string,
  mision: string,
  data: { nombreEs: string | null; pasos: StepInput[] }
): Promise<void> {
  await saveOverride(mision, data);
  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/admin/${slug}/${encodeURIComponent(mision)}`);
  revalidatePath(`/guias/${slug}`);
}

export async function deleteMission(slug: string, mision: string): Promise<void> {
  await deleteOverride(mision);
  revalidatePath(`/admin/${slug}`);
  revalidatePath(`/admin/${slug}/${encodeURIComponent(mision)}`);
  revalidatePath(`/guias/${slug}`);
}
