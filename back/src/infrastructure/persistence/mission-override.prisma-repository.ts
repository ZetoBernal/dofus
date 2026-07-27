import { Injectable } from "@nestjs/common";
import {
  MissionOverrideRepository,
  SaveOverrideInput,
} from "../../domain/mission-override/mission-override.repository";
import { MissionOverride } from "../../domain/mission-override/mission-override.entity";
import { PrismaService } from "./prisma.service";

@Injectable()
export class MissionOverridePrismaRepository extends MissionOverrideRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<MissionOverride[]> {
    const rows = await this.prisma.missionOverride.findMany({
      include: { pasos: { orderBy: { orden: "asc" } } },
    });
    return rows.map(
      (row) =>
        new MissionOverride(
          row.mision,
          row.nombreEs,
          row.pasos.map((p) => ({ texto: p.texto, imagen: p.imagen }))
        )
    );
  }

  async findByMision(mision: string): Promise<MissionOverride | null> {
    const row = await this.prisma.missionOverride.findUnique({
      where: { mision },
      include: { pasos: { orderBy: { orden: "asc" } } },
    });
    if (!row) return null;
    return new MissionOverride(
      row.mision,
      row.nombreEs,
      row.pasos.map((p) => ({ texto: p.texto, imagen: p.imagen }))
    );
  }

  async save(mision: string, data: SaveOverrideInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const override = await tx.missionOverride.upsert({
        where: { mision },
        create: { mision, nombreEs: data.nombreEs },
        update: { nombreEs: data.nombreEs },
      });
      await tx.step.deleteMany({ where: { overrideId: override.id } });
      if (data.pasos.length > 0) {
        await tx.step.createMany({
          data: data.pasos.map((p, i) => ({
            overrideId: override.id,
            orden: i,
            texto: p.texto,
            imagen: p.imagen,
          })),
        });
      }
    });
  }

  async delete(mision: string): Promise<void> {
    await this.prisma.missionOverride.deleteMany({ where: { mision } });
  }
}
