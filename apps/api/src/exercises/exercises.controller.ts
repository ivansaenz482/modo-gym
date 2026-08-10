import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ExercisesService } from "./exercises.service.js";
import { CreateExerciseDto } from "./dto/create-exercise.dto.js";
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
  create(@Body() dto: CreateExerciseDto) {
    return this.exercises.create(dto);
  }
}
