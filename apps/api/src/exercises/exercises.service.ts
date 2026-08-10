import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateExerciseDto } from "./dto/create-exercise.dto.js";

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(muscleGroup?: string) {
    return this.prisma.exercise.findMany({
      where: muscleGroup ? { muscleGroup } : undefined,
      orderBy: { name: "asc" },
    });
  }

  findOne(id: string) {
    return this.prisma.exercise.findUnique({ where: { id } });
  }

  async create(dto: CreateExerciseDto) {
    const existing = await this.prisma.exercise.findFirst({
      where: { name: dto.name },
    });
    if (existing) return existing;
    return this.prisma.exercise.create({ data: dto });
  }
}
