import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const clients = await this.prisma.user.findMany({
      where: { role: "CLIENT" },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        createdAt: true,
        profile: { select: { age: true, goal: true, daysPerWeek: true } },
        _count: {
          select: { routines: true, progress: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return clients.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      age: c.profile?.age ?? null,
      goal: c.profile?.goal ?? null,
      daysPerWeek: c.profile?.daysPerWeek ?? null,
      activeRoutineCount: c._count.routines,
      progressCount: c._count.progress,
      createdAt: c.createdAt,
    }));
  }

  async findOne(id: string, requesterId?: string, requesterRole?: string) {
    const isOwner = requesterId === id;
    if (requesterRole !== "ADMIN" && !isOwner) {
      throw new ForbiddenException("No puedes ver los datos de otro cliente");
    }

    const client = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        routines: {
          where: { isActive: true },
          include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
          orderBy: { updatedAt: "desc" },
        },
        progress: { orderBy: { date: "desc" } },
        nutrition: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!client) throw new NotFoundException("Cliente no encontrado");
    delete (client as Partial<typeof client>).passwordHash;
    return client;
  }

  async updateProfile(id: string, requesterId: string, requesterRole: string, dto: UpdateProfileDto) {
    if (requesterRole !== "ADMIN" && requesterId !== id) {
      throw new ForbiddenException("No puedes editar otro cliente");
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Cliente no encontrado");

    await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        phone: dto.phone ?? undefined,
        profile: {
          upsert: {
            create: {
              age: dto.age,
              gender: dto.gender,
              heightCm: dto.heightCm,
              startWeightKg: dto.startWeightKg,
              goal: dto.goal,
              daysPerWeek: dto.daysPerWeek ?? 3,
              experience: dto.experience,
              notes: dto.notes,
            },
            update: {
              age: dto.age ?? undefined,
              gender: dto.gender ?? undefined,
              heightCm: dto.heightCm ?? undefined,
              startWeightKg: dto.startWeightKg ?? undefined,
              goal: dto.goal ?? undefined,
              daysPerWeek: dto.daysPerWeek ?? undefined,
              experience: dto.experience ?? undefined,
              notes: dto.notes ?? undefined,
            },
          },
        },
      },
    });

    return this.findOne(id, requesterId, requesterRole);
  }
}
