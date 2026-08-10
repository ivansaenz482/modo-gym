import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const exercises = [
  { name: "Press de banca", muscleGroup: "Pecho", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", videoUrl: "" },
  { name: "Sentadilla", muscleGroup: "Pierna", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800", videoUrl: "" },
  { name: "Peso muerto", muscleGroup: "Espalda", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=800", videoUrl: "" },
  { name: "Press militar", muscleGroup: "Hombros", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800", videoUrl: "" },
  { name: "Remo con barra", muscleGroup: "Espalda", category: "Fuerza", imageUrl: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=800", videoUrl: "" },
  { name: "Curl de bíceps", muscleGroup: "Bíceps", category: "Aislamiento", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800", videoUrl: "" },
  { name: "Fondos", muscleGroup: "Tríceps", category: "Peso corporal", imageUrl: "https://images.unsplash.com/photo-1562426509-5049a35de0b6?w=800", videoUrl: "" },
  { name: "Plancha", muscleGroup: "Core", category: "Peso corporal", imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800", videoUrl: "" },
  { name: "Dominadas", muscleGroup: "Espalda", category: "Peso corporal", imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800", videoUrl: "" },
  { name: "Zancadas", muscleGroup: "Pierna", category: "Peso corporal", imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800", videoUrl: "" },
];

async function main() {
  console.log("🌱 Sembrando base de datos MODO GYM...");

  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@modogym.com" },
    update: {},
    create: {
      email: "admin@modogym.com",
      passwordHash: adminHash,
      name: "Administrador",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin creado:", admin.email);

  const clientHash = await bcrypt.hash("cliente123", 10);
  const client = await prisma.user.upsert({
    where: { email: "cliente@modogym.com" },
    update: {},
    create: {
      email: "cliente@modogym.com",
      passwordHash: clientHash,
      name: "Cliente Demo",
      phone: "0999837540",
      role: "CLIENT",
      profile: {
        create: {
          age: 28,
          gender: "Masculino",
          heightCm: 175,
          startWeightKg: 82,
          goal: "GANAR_MASA",
          daysPerWeek: 4,
          experience: "INTERMEDIO",
        },
      },
    },
    include: { profile: true },
  });
  console.log("✅ Cliente demo creado:", client.email);

  let counter = 0;
  for (const ex of exercises) {
    const exists = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (!exists) {
      await prisma.exercise.create({ data: ex });
      counter++;
    }
  }
  console.log(`✅ Ejercicios sembrados (${counter} nuevos)`);

  const routine = await prisma.routine.findFirst({ where: { clientId: client.id } });
  if (!routine) {
    const created = await prisma.routine.create({
      data: {
        clientId: client.id,
        name: "Rutina fuerza 4 días",
        source: "PROPIA",
        daysPerWeek: 4,
        isActive: true,
      },
    });
    const all = await prisma.exercise.findMany();
    await prisma.routineExercise.createMany({
      data: all.slice(0, 6).map((ex, i) => ({
        routineId: created.id,
        exerciseId: ex.id,
        order: i + 1,
        sets: 4,
        reps: "8-12",
        restSeconds: 90,
        weightKg: 40 + i * 10,
      })),
    });
    console.log("✅ Rutina demo creada");
  }

  await prisma.nutritionPlan.upsert({
    where: { id: "seed-nutrition-1" },
    update: {},
    create: {
      id: "seed-nutrition-1",
      clientId: client.id,
      name: "Plan ganar masa",
      dailyCalories: 2800,
      proteinG: 160,
      carbsG: 320,
      fatG: 90,
      notes: "Desayuno: avena + huevos. Comida: arroz + pollo. Cena: salmón + ensalada.",
    },
  });
  console.log("✅ Plan nutricional demo creado");

  const existingProgress = await prisma.progressEntry.count({ where: { clientId: client.id } });
  if (existingProgress === 0) {
    await prisma.progressEntry.createMany({
      data: [
        { clientId: client.id, weightKg: 82, bodyFatPct: 18, date: new Date("2026-07-01") },
        { clientId: client.id, weightKg: 81.4, bodyFatPct: 17.5, date: new Date("2026-07-15") },
        { clientId: client.id, weightKg: 80.8, bodyFatPct: 17, chestCm: 98, date: new Date("2026-07-29") },
      ],
    });
    console.log("✅ Progreso demo creado");
  }

  console.log("🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
