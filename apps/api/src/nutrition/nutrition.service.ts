import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.nutritionPlan.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
