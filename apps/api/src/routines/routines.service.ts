import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateRoutineDto } from "./dto/create-routine.dto.js";

@Injectable()
export class RoutinesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, requesterId: string, requesterRole: string, dto: CreateRoutineDto) {
    if (requesterRole !== "ADMIN" && requesterId !== clientId) {
      throw new ForbiddenException("No puedes crear rutinas para otro cliente");
    }

    const routine = await this.prisma.routine.create({
      data: {
        clientId,
        name: dto.name,
        source: "PROPIA",
        daysPerWeek: dto.daysPerWeek ?? 3,
        isActive: true,
      },
    });

    await this.prisma.routineExercise.createMany({
      data: dto.exercises.map((e, i) => ({
        routineId: routine.id,
        exerciseId: e.exerciseId,
        order: i + 1,
        sets: e.sets,
        reps: e.reps,
        restSeconds: e.restSeconds ?? 60,
        weightKg: e.weightKg ?? null,
      })),
    });

    return this.prisma.routine.findUnique({
      where: { id: routine.id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });
  }

  async findMine(userId: string) {
    return this.prisma.routine.findMany({
      where: { clientId: userId },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findOne(id: string, requesterId: string, requesterRole: string) {
    const routine = await this.prisma.routine.findUnique({
      where: { id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });
    if (!routine) throw new NotFoundException("Rutina no encontrada");
    if (requesterRole !== "ADMIN" && routine.clientId !== requesterId) {
      throw new ForbiddenException("No puedes ver esta rutina");
    }
    return routine;
  }

  async remove(id: string, requesterId: string, requesterRole: string) {
    const routine = await this.prisma.routine.findUnique({ where: { id } });
    if (!routine) throw new NotFoundException("Rutina no encontrada");
    if (requesterRole !== "ADMIN" && routine.clientId !== requesterId) {
      throw new ForbiddenException("No puedes eliminar esta rutina");
    }
    await this.prisma.routine.delete({ where: { id } });
    return { ok: true };
  }
}
