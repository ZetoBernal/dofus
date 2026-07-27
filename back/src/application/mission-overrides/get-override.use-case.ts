import { Injectable } from "@nestjs/common";
import { MissionOverrideRepository } from "../../domain/mission-override/mission-override.repository";
import { MissionOverride } from "../../domain/mission-override/mission-override.entity";

@Injectable()
export class GetOverrideUseCase {
  constructor(private readonly repository: MissionOverrideRepository) {}

  execute(mision: string): Promise<MissionOverride | null> {
    return this.repository.findByMision(mision);
  }
}
