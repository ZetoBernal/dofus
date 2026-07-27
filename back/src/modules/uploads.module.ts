import { Module } from "@nestjs/common";
import { UploadsController } from "../infrastructure/http/controllers/uploads.controller";
import { LocalFileStorage } from "../infrastructure/storage/local-file-storage";
import { FileStorage } from "../domain/uploads/file-storage";
import { UploadStepImageUseCase } from "../application/uploads/upload-step-image.use-case";
import { AuthModule } from "./auth.module";

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [{ provide: FileStorage, useClass: LocalFileStorage }, UploadStepImageUseCase],
})
export class UploadsModule {}
