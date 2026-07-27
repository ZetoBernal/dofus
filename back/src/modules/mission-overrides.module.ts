import { Module } from "@nestjs/common";
import { MissionOverridesController } from "../infrastructure/http/controllers/mission-overrides.controller";
import { MissionOverridePrismaRepository } from "../infrastructure/persistence/mission-override.prisma-repository";
import { MissionOverrideRepository } from "../domain/mission-override/mission-override.repository";
import { GetAllOverridesUseCase } from "../application/mission-overrides/get-all-overrides.use-case";
import { GetOverrideUseCase } from "../application/mission-overrides/get-override.use-case";
import { SaveOverrideUseCase } from "../application/mission-overrides/save-override.use-case";
import { DeleteOverrideUseCase } from "../application/mission-overrides/delete-override.use-case";
import { AuthModule } from "./auth.module";

@Module({
  imports: [AuthModule],
  controllers: [MissionOverridesController],
  providers: [
    { provide: MissionOverrideRepository, useClass: MissionOverridePrismaRepository },
    GetAllOverridesUseCase,
    GetOverrideUseCase,
    SaveOverrideUseCase,
    DeleteOverrideUseCase,
  ],
})
export class MissionOverridesModule {}
