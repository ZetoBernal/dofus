import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadStepImageUseCase } from "../../../application/uploads/upload-step-image.use-case";
import { SessionAuthGuard } from "../guards/session-auth.guard";

@Controller("uploads")
@UseGuards(SessionAuthGuard)
export class UploadsController {
  constructor(private readonly uploadStepImage: UploadStepImageUseCase) {}

  @Post("steps")
  @UseInterceptors(FileInterceptor("file"))
  async uploadStep(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No se recibió ningún archivo.");
    }
    const path = await this.uploadStepImage.execute({
      buffer: file.buffer,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });
    return { path };
  }
}
