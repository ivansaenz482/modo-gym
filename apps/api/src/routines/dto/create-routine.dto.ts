import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class RoutineExerciseItemDto {
  @ApiProperty({ description: "ID del ejercicio de la biblioteca" })
  @IsString()
  exerciseId: string;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(10)
  sets: number;

  @ApiProperty({ example: "8-12" })
  @IsString()
  reps: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsInt()
  weightKg?: number;
}

export class CreateRoutineDto {
  @ApiProperty({ example: "Mi rutina de empuje" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  daysPerWeek?: number;

  @ApiProperty({ type: [RoutineExerciseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseItemDto)
  exercises: RoutineExerciseItemDto[];
}
