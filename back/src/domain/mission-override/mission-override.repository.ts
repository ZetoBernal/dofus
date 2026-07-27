import { MissionOverride, Step } from "./mission-override.entity";

export interface SaveOverrideInput {
  nombreEs: string | null;
  pasos: Step[];
}

export abstract class MissionOverrideRepository {
  abstract findAll(): Promise<MissionOverride[]>;
  abstract findByMision(mision: string): Promise<MissionOverride | null>;
  abstract save(mision: string, data: SaveOverrideInput): Promise<void>;
  abstract delete(mision: string): Promise<void>;
}
