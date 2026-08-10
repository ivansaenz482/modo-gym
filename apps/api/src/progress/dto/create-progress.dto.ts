import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateProgressDto {
  @ApiPropertyOptional({ description: "Fecha del registro (ISO)", example: "2026-08-01" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ example: 80.5 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(400)
  weightKg?: number;

  @ApiPropertyOptional({ example: 17 })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(60)
  bodyFatPct?: number;

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(200)
  chestCm?: number;

  @ApiPropertyOptional({ example: 82 })
  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(200)
  waistCm?: number;

  @ApiPropertyOptional({ example: 38 })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(80)
  armCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
