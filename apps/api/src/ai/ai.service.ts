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

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/**
 * El calentamiento siempre se incluye, antes de cualquier split.
 */
function warmupDay(): GeneratedDay {
  return {
    name: "Calentamiento",
    exercises: [
      { name: "Rotación de brazos", muscleGroup: "Calentamiento", sets: 2, reps: "10 por lado", restSeconds: 20, weightKg: null },
      { name: "Círculos de cadera", muscleGroup: "Calentamiento", sets: 2, reps: "10 por lado", restSeconds: 20, weightKg: null },
      { name: "Sentadilla con peso corporal", muscleGroup: "Calentamiento", sets: 2, reps: "12", restSeconds: 30, weightKg: null },
      { name: "Zancadas", muscleGroup: "Pierna", sets: 2, reps: "10 por pierna", restSeconds: 30, weightKg: null },
      { name: "Plancha", muscleGroup: "Core", sets: 2, reps: "20-30 seg", restSeconds: 30, weightKg: null },
    ],
  };
}

/** Split por día según la cantidad de días de entrenamiento. */
const DAY_SPLITS: Record<string, { name: string; groups: string[] }[]> = {
  "1": [{ name: "Full Body", groups: ["Pecho", "Espalda", "Pierna"] }],
  "2": [
    { name: "Full Body", groups: ["Pecho", "Espalda", "Pierna"] },
    { name: "Full Body", groups: ["Hombros", "Core", "Pierna"] },
  ],
  "3": [
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps", groups: ["Espalda", "Bíceps"] },
  ],
  "4": [
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps", groups: ["Espalda", "Bíceps"] },
    { name: "Tríceps y cardio", groups: ["Tríceps", "Core"] },
  ],
  "5": [
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps", groups: ["Espalda", "Bíceps"] },
    { name: "Tríceps y core", groups: ["Tríceps", "Core"] },
    { name: "Cardio y abdomen", groups: ["Core", "Pierna"] },
  ],
  "6": [
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps", groups: ["Espalda", "Bíceps"] },
    { name: "Tríceps y cardio", groups: ["Tríceps", "Core"] },
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
  ],
  "7": [
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps", groups: ["Espalda", "Bíceps"] },
    { name: "Tríceps y cardio", groups: ["Tríceps", "Core"] },
    { name: "Pecho y hombros", groups: ["Pecho", "Hombros"] },
    { name: "Piernas y glúteos", groups: ["Pierna"] },
    { name: "Espalda y bíceps + core", groups: ["Espalda", "Bíceps", "Core"] },
  ],
};

const REPS_BY_GOAL: Record<string, string> = {
  GANAR_MASA: "6-10",
  PERDER_PESO: "12-15",
  TONIFICAR: "10-12",
  RESISTENCIA: "15-20",
  SALUD: "10-15",
};

const NUTRITION_NOTES: Record<string, string> = {
  PERDER_PESO:
    "Distribuye las comidas en 5 al día con porciones moderadas. Prioriza proteína magra, vegetales y agua (2-3 L/día). Evita azúcares y frituras.",
  GANAR_MASA:
    "Come 5 veces al día con porciones abundantes y un superávit moderado. Añade carbohidratos en cada comida principal y proteína en todas.",
  TONIFICAR:
    "5 comidas al día balanceadas. Proteína en cada comida, carbohidratos complejos y grasas saludables. Hidrátate bien.",
  RESISTENCIA:
    "Rico en carbohidratos para energía sostenida, con proteína para recuperación. Come 1-2 h antes de entrenar.",
  SALUD:
    "Alimentación equilibrada y variada: vegetales, frutas, proteína magra y granos enteros. Agua 2-3 L/día.",
};

const PROTEINS = ["pollo a la plancha", "salmón", "carne magra", "pavo al horno", "atún", "huevos", "lentejas"];
const CARBS = ["arroz integral", "batata asada", "quinoa", "papa cocida", "avena", "pasta integral", "tortilla de maíz"];
const VEGGIES = ["brócoli al vapor", "ensalada verde", "espárragos", "pimientos salteados", "zanahoria", "calabacín", "espinaca"];

function buildDailyMeals(goal: string, i: number) {
  const p = PROTEINS[i % PROTEINS.length];
  const c = CARBS[i % CARBS.length];
  const v = VEGGIES[i % VEGGIES.length];
  const p2 = PROTEINS[(i + 3) % PROTEINS.length];
  const losing = goal === "PERDER_PESO";
  const bulking = goal === "GANAR_MASA";
  const portion = losing ? " (porción moderada)" : bulking ? " (porción abundante)" : "";
  return [
    { type: "Desayuno", food: `Avena con leche${portion} + ${p} revuelto + fruta.` },
    { type: "Media mañana", food: losing ? "Yogur griego sin azúcar con nueces." : "Yogur con granola y banana." },
    { type: "Almuerzo", food: `${c}${portion} + ${p} + ${v}.` },
    { type: "Merienda", food: bulking ? "Tostada integral con crema de maní y miel." : "Tostada integral con crema de maní." },
    { type: "Cena", food: `${p2} + ensalada mixta ligera.` },
  ];
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
   * Siempre antepone un día de calentamiento.
   */
  async generateRoutine(clientId: string, dto: GenerateRoutineDto) {
    const source = await this.tryN8n(dto);
    const generated = source ?? (await this.fallbackRoutine(dto));
    generated.days = [warmupDay(), ...generated.days];

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

    const days = WEEKDAYS.map((day, i) => ({
      day,
      meals: buildDailyMeals(goal, i),
    }));

    const data = {
      name: `Plan ${goal.toLowerCase().replace("_", " ")}`,
      dailyCalories: Math.round(macros.calories),
      proteinG: Math.round(weight * macros.protein),
      carbsG: Math.round(weight * macros.carbs),
      fatG: Math.round(weight * macros.fat),
      days,
      notes: NUTRITION_NOTES[goal] ?? NUTRITION_NOTES.SALUD,
    };

    const plan = existing
      ? await this.prisma.nutritionPlan.update({ where: { id: existing.id }, data })
      : await this.prisma.nutritionPlan.create({ data: { clientId, ...data } });
    return plan;
  }

  private async tryN8n(dto: GenerateRoutineDto): Promise<GeneratedRoutine | null> {
    const base = this.config.get<string>("N8N_WEBHOOK_URL");
    const apiKey = this.config.get<string>("N8N_API_KEY");
    const path = this.config.get<string>("N8N_ROUTINE_WEBHOOK_PATH") || "/webhook/routine-generator";

    if (!base || base.includes("cambia_por")) {
      this.logger.warn("N8n no configurado, usando generador local");
      return null;
    }

    const timeoutMs = Number(this.config.get("N8N_TIMEOUT_MS")) || 60000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey && !apiKey.includes("cambia_por")) {
        headers.Authorization = `Bearer ${apiKey}`;
      }
      const res = await fetch(`${base}${path}`, {
        method: "POST",
        headers,
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

    const exerciseLinks: {
      routineId: string;
      exerciseId: string;
      day: number;
      dayName: string | null;
      order: number;
      sets: number;
      reps: string;
      restSeconds: number;
      weightKg: number | null;
    }[] = [];

    let day = 0;
    for (const group of g.days) {
      day += 1;
      let order = 0;
      for (const ex of group.exercises) {
        order += 1;
        let exercise = await this.prisma.exercise.findFirst({
          where: { name: ex.name },
        });
        if (!exercise) {
          let imageUrl: string | null = null;
          if (ex.muscleGroup) {
            // Reutiliza una imagen representativa del grupo muscular para que
            // los ejercicios generados por IA también muestren una referencia visual.
            const rep = await this.prisma.exercise.findFirst({
              where: { muscleGroup: ex.muscleGroup, imageUrl: { not: null } },
            });
            imageUrl = rep?.imageUrl ?? null;
          }
          exercise = await this.prisma.exercise.create({
            data: {
              name: ex.name,
              muscleGroup: ex.muscleGroup || "General",
              category: "Generado por IA",
              imageUrl,
            },
          });
        }
        exerciseLinks.push({
          routineId: routine.id,
          exerciseId: exercise.id,
          day,
          dayName: group.name || null,
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
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: [{ day: "asc" }, { order: "asc" }],
        },
      },
    });
  }

  /**
   * Generador local: reparte ejercicios por grupos musculares según el split
   * de días elegido (pecho/hombros, piernas/glúteos, espalda/bíceps, tríceps/cardio).
   */
  private async fallbackRoutine(dto: GenerateRoutineDto): Promise<GeneratedRoutine> {
    const all = await this.prisma.exercise.findMany();

    const dayNames = DAY_SPLITS[String(dto.daysPerWeek)] || DAY_SPLITS["3"];
    const reps = REPS_BY_GOAL[dto.goal] || "10-12";

    const days: GeneratedDay[] = dayNames.map(({ name, groups }) => {
      const matching = all.filter((e) => groups.includes(e.muscleGroup));
      const chosen: typeof all = [];
      for (let k = 0; k < matching.length && chosen.length < 5; k++) {
        chosen.push(matching[k]);
      }
      if (chosen.length < 5) {
        for (const e of all) {
          if (chosen.length >= 5) break;
          if (groups.includes(e.muscleGroup)) continue;
          if (chosen.some((c) => c.id === e.id)) continue;
          chosen.push(e);
        }
      }
      return {
        name,
        exercises: chosen.map((e) => ({
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
