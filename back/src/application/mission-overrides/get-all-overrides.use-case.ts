import { Injectable } from "@nestjs/common";
import { MissionOverrideRepository } from "../../domain/mission-override/mission-override.repository";
import { MissionOverride } from "../../domain/mission-override/mission-override.entity";

@Injectable()
export class GetAllOverridesUseCase {
  constructor(private readonly repository: MissionOverrideRepository) {}

  execute(): Promise<MissionOverride[]> {
    return this.repository.findAll();
  }
}
