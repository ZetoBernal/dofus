import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class StepDto {
  @IsString()
  texto!: string;

  @IsOptional()
  @IsString()
  imagen!: string | null;
}

export class SaveOverrideDto {
  @IsOptional()
  @IsString()
  nombreEs!: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  pasos!: StepDto[];
}
