import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum AiGoal {
  PERDER_PESO = "PERDER_PESO",
  GANAR_MASA = "GANAR_MASA",
  TONIFICAR = "TONIFICAR",
  RESISTENCIA = "RESISTENCIA",
  SALUD = "SALUD",
}

export enum AiExperience {
  PRINCIPIANTE = "PRINCIPIANTE",
  INTERMEDIO = "INTERMEDIO",
  AVANZADO = "AVANZADO",
}

export class GenerateRoutineDto {
  @ApiProperty({ example: 4, description: "Días de entrenamiento por semana" })
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek: number;

  @ApiProperty({ enum: AiGoal, example: AiGoal.GANAR_MASA })
  @IsEnum(AiGoal)
  goal: AiGoal;

  @ApiProperty({ enum: AiExperience, example: AiExperience.INTERMEDIO })
  @IsEnum(AiExperience)
  experience: AiExperience;

  @ApiPropertyOptional({ example: "Gimnasio" })
  @IsOptional()
  @IsString()
  equipment?: string;

  @ApiPropertyOptional({ example: "Evitar lesiones en la espalda baja" })
  @IsOptional()
  @IsString()
  notes?: string;
}
