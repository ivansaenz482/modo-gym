import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ExercisesService } from "./exercises.service.js";
import { CreateExerciseDto } from "./dto/create-exercise.dto.js";
import { UpdateExerciseDto } from "./dto/update-exercise.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";

@ApiTags("exercises")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("exercises")
export class ExercisesController {
  constructor(private readonly exercises: ExercisesService) {}

  @Get()
  findAll(@Query("muscleGroup") muscleGroup?: string) {
    return this.exercises.findAll(muscleGroup);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.exercises.findOne(id);
  }

  @Post()
  @Roles("ADMIN")
  @ApiOperation({ summary: "Crear ejercicio (admin)" })
  create(@Body() dto: CreateExerciseDto) {
    return this.exercises.create(dto);
  }

  @Patch(":id")
  @Roles("ADMIN")
  @ApiOperation({ summary: "Actualizar ejercicio (imagen/video) (admin)" })
  async update(@Param("id") id: string, @Body() dto: UpdateExerciseDto) {
    const updated = await this.exercises.update(id, dto);
    if (!updated) throw new NotFoundException("Ejercicio no encontrado");
    return updated;
  }
}
