import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateExerciseDto {
  @ApiProperty({ example: "Press de banca" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "Pecho" })
  @IsString()
  muscleGroup: string;

  @ApiProperty({ example: "Fuerza" })
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "https://.../ejercicio.jpg" })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: "https://.../ejercicio.mp4" })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}
