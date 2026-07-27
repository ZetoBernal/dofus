import { Injectable } from "@nestjs/common";
import { MissionOverrideRepository } from "../../domain/mission-override/mission-override.repository";

@Injectable()
export class DeleteOverrideUseCase {
  constructor(private readonly repository: MissionOverrideRepository) {}

  execute(mision: string): Promise<void> {
    return this.repository.delete(mision);
  }
}
