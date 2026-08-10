import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service.js";
import { GenerateRoutineDto } from "./dto/generate-routine.dto.js";

export interface GeneratedExercise {
  name: string;
  muscleGroup?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weightKg?: number | null;
}

export interface GeneratedDay {
  name: string;
  exercises: GeneratedExercise[];
}

export interface GeneratedRoutine {
  name: string;
  daysPerWeek: number;
  days: GeneratedDay[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Genera una rutina. Primero intenta con N8n; si no está configurado
   * o falla, usa un generador local de respaldo (para pruebas gratis).
   */
  async generateRoutine(clientId: string, dto: GenerateRoutineDto) {
    const source = await this.tryN8n(dto);
    const generated = source ?? (await this.fallbackRoutine(dto));

    const routine = await this.saveRoutine(clientId, generated, source ? "IA" : "PROPIA");
    return routine;
  }

  async generateNutrition(clientId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: clientId },
      include: { profile: true },
    });
    if (!user) throw new ServiceUnavailableException("Cliente no encontrado");

    const goal = user.profile?.goal ?? "SALUD";
    const base =
      (user.profile?.heightCm ?? 170) - 100 + 10; // Harris-Benedict aproximado (ligero)

    const macrosByGoal = {
      PERDER_PESO: { calories: base * 14, protein: 2.0, carbs: 2.5, fat: 0.9 },
      GANAR_MASA: { calories: base * 20, protein: 2.2, carbs: 4.0, fat: 1.0 },
      TONIFICAR: { calories: base * 17, protein: 2.0, carbs: 3.0, fat: 0.9 },
      RESISTENCIA: { calories: base * 19, protein: 1.8, carbs: 4.5, fat: 1.0 },
      SALUD: { calories: base * 16, protein: 1.6, carbs: 3.0, fat: 0.9 },
    };
    const macros = macrosByGoal[goal] ?? macrosByGoal.SALUD;

    const weight = user.profile?.startWeightKg ?? 70;
    const existing = await this.prisma.nutritionPlan.findFirst({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });

    const data = {
      name: `Plan ${goal.toLowerCase().replace("_", " ")}`,
      dailyCalories: Math.round(macros.calories),
      proteinG: Math.round(weight * macros.protein),
      carbsG: Math.round(weight * macros.carbs),
      fatG: Math.round(weight * macros.fat),
    };

    const plan = existing
      ? await this.prisma.nutritionPlan.update({ where: { id: existing.id }, data })
      : await this.prisma.nutritionPlan.create({
          data: {
            clientId,
            ...data,
            notes: "Distribuye las comidas en 4-5 al día. Prioriza proteína magra, vegetales y agua (2-3 L/día).",
          },
        });
    return plan;
  }

  private async tryN8n(dto: GenerateRoutineDto): Promise<GeneratedRoutine | null> {
    const base = this.config.get<string>("N8N_WEBHOOK_URL");
    const apiKey = this.config.get<string>("N8N_API_KEY");
    const path = this.config.get<string>("N8N_ROUTINE_WEBHOOK_PATH") || "/webhook/routine-generator";

    if (!base || !apiKey || apiKey.includes("cambia_por")) {
      this.logger.warn("N8n no configurado, usando generador local");
      return null;
    }

    const timeoutMs = Number(this.config.get("N8N_TIMEOUT_MS")) || 60000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(dto),
        signal: controller.signal,
      });
      if (!res.ok) {
        this.logger.error(`N8n respondió ${res.status}`);
        return null;
      }
      const data = await res.json();
      return this.normalizeN8nResponse(data, dto);
    } catch (err) {
      this.logger.error("Error llamando a N8n:", err instanceof Error ? err.message : err);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private normalizeN8nResponse(data: any, dto: GenerateRoutineDto): GeneratedRoutine | null {
    if (!data || !Array.isArray(data.days)) return null;
    return {
      name: data.name || `Rutina IA ${dto.daysPerWeek} días`,
      daysPerWeek: dto.daysPerWeek,
      days: data.days.map((d: any) => ({
        name: d.name || "Día",
        exercises: (d.exercises || []).map((e: any) => ({
          name: e.name,
          muscleGroup: e.muscleGroup,
          sets: Number(e.sets) || 3,
          reps: String(e.reps || "8-12"),
          restSeconds: Number(e.restSeconds) || 60,
          weightKg: e.weightKg != null ? Number(e.weightKg) : null,
        })),
      })),
    };
  }

  private async saveRoutine(clientId: string, g: GeneratedRoutine, source: "IA" | "PROPIA") {
    const routine = await this.prisma.routine.create({
      data: {
        clientId,
        name: g.name,
        source,
        daysPerWeek: g.daysPerWeek,
        isActive: true,
      },
    });

    let order = 0;
    const exerciseLinks: {
      routineId: string;
      exerciseId: string;
      order: number;
      sets: number;
      reps: string;
      restSeconds: number;
      weightKg: number | null;
    }[] = [];
    for (const day of g.days) {
      for (const ex of day.exercises) {
        order += 1;
        let exercise = await this.prisma.exercise.findFirst({
          where: { name: ex.name },
        });
        if (!exercise) {
          exercise = await this.prisma.exercise.create({
            data: {
              name: ex.name,
              muscleGroup: ex.muscleGroup || "General",
              category: "Generado por IA",
            },
          });
        }
        exerciseLinks.push({
          routineId: routine.id,
          exerciseId: exercise.id,
          order,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          weightKg: ex.weightKg ?? null,
        });
      }
    }

    await this.prisma.routineExercise.createMany({ data: exerciseLinks });

    return this.prisma.routine.findUnique({
      where: { id: routine.id },
      include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } },
    });
  }

  /**
   * Generador local: reparte ejercicios por grupos musculares según días.
   * Push / Pull / Legs para 3+ días; full body para 1-2 días.
   */
  private async fallbackRoutine(dto: GenerateRoutineDto): Promise<GeneratedRoutine> {
    const all = await this.prisma.exercise.findMany();

    const splits: Record<string, string[]> = {
      "1": ["Full Body"],
      "2": ["Full Body", "Full Body"],
      "3": ["Push (Pecho, hombros, tríceps)", "Pull (Espalda, bíceps)", "Pierna"],
      "4": ["Push", "Pull", "Pierna", "Full Body"],
      "5": ["Push", "Pull", "Pierna", "Full Body", "Core + Cardio"],
      "6": ["Push", "Pull", "Pierna", "Push", "Pull", "Pierna"],
      "7": ["Push", "Pull", "Pierna", "Push", "Pull", "Pierna", "Full Body"],
    };

    const dayNames = splits[String(dto.daysPerWeek)] || splits["3"];
    const repsMap: Record<string, string> = {
      GANAR_MASA: "6-10",
      PERDER_PESO: "12-15",
      TONIFICAR: "10-12",
      RESISTENCIA: "15-20",
      SALUD: "10-15",
    };
    const reps = repsMap[dto.goal] || "10-12";

    const days: GeneratedDay[] = dayNames.map((name, i) => {
      const chosen = all.filter((_, idx) => idx % dayNames.length === i).slice(0, 5);
      const pool = chosen.length >= 3 ? chosen : all.slice(i * 3, i * 3 + 4);
      return {
        name,
        exercises: pool.map((e) => ({
          name: e.name,
          muscleGroup: e.muscleGroup,
          sets: dto.experience === "PRINCIPIANTE" ? 3 : 4,
          reps,
          restSeconds: 75,
          weightKg: null,
        })),
      };
    });

    const goalLabel = dto.goal.replace("_", " ").toLowerCase();
    return {
      name: `Rutina ${goalLabel} · ${dto.daysPerWeek} días`,
      daysPerWeek: dto.daysPerWeek,
      days,
    };
  }
}
