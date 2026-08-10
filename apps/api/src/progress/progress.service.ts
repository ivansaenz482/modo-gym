import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateProgressDto } from "./dto/create-progress.dto.js";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, requesterId: string, requesterRole: string, dto: CreateProgressDto) {
    if (requesterRole !== "ADMIN" && requesterId !== clientId) {
      throw new ForbiddenException("No puedes registrar progreso de otro cliente");
    }
    return this.prisma.progressEntry.create({
      data: {
        clientId,
        date: dto.date ? new Date(dto.date) : new Date(),
        weightKg: dto.weightKg,
        bodyFatPct: dto.bodyFatPct,
        chestCm: dto.chestCm,
        waistCm: dto.waistCm,
        armCm: dto.armCm,
        notes: dto.notes,
      },
    });
  }

  async findMine(userId: string) {
    return this.prisma.progressEntry.findMany({
      where: { clientId: userId },
      orderBy: { date: "desc" },
    });
  }

  async remove(id: string, requesterId: string, requesterRole: string) {
    const entry = await this.prisma.progressEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException("Registro no encontrado");
    if (requesterRole !== "ADMIN" && entry.clientId !== requesterId) {
      throw new ForbiddenException("No puedes eliminar este registro");
    }
    await this.prisma.progressEntry.delete({ where: { id } });
    return { ok: true };
  }
}
