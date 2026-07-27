import { Injectable } from "@nestjs/common";
import {
  MissionOverrideRepository,
  SaveOverrideInput,
} from "../../domain/mission-override/mission-override.repository";

@Injectable()
export class SaveOverrideUseCase {
  constructor(private readonly repository: MissionOverrideRepository) {}

  execute(mision: string, data: SaveOverrideInput): Promise<void> {
    const nombreEs = data.nombreEs?.trim() || null;
    const pasos = data.pasos
      .filter((p) => p.texto.trim().length > 0)
      .map((p) => ({ texto: p.texto.trim(), imagen: p.imagen }));

    return this.repository.save(mision, { nombreEs, pasos });
  }
}
