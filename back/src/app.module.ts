import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PersistenceModule } from "./modules/persistence.module";
import { AuthModule } from "./modules/auth.module";
import { MissionOverridesModule } from "./modules/mission-overrides.module";
import { UploadsModule } from "./modules/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    AuthModule,
    MissionOverridesModule,
    UploadsModule,
  ],
})
export class AppModule {}
