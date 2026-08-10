import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export enum ProfileGoal {
  PERDER_PESO = "PERDER_PESO",
  GANAR_MASA = "GANAR_MASA",
  TONIFICAR = "TONIFICAR",
  RESISTENCIA = "RESISTENCIA",
  SALUD = "SALUD",
}

export enum ExperienceLevel {
  PRINCIPIANTE = "PRINCIPIANTE",
  INTERMEDIO = "INTERMEDIO",
  AVANZADO = "AVANZADO",
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "Cliente Demo" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "0999837540" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 28 })
  @IsOptional()
  @IsInt()
  @Min(14)
  @Max(100)
  age?: number;

  @ApiPropertyOptional({ example: "Masculino" })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(250)
  heightCm?: number;

  @ApiPropertyOptional({ example: 82 })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(400)
  startWeightKg?: number;

  @ApiPropertyOptional({ enum: ProfileGoal })
  @IsOptional()
  @IsEnum(ProfileGoal)
  goal?: ProfileGoal;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
