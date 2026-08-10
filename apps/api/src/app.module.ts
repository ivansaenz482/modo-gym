import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { ClientsModule } from "./clients/clients.module.js";
import { ExercisesModule } from "./exercises/exercises.module.js";
import { RoutinesModule } from "./routines/routines.module.js";
import { ProgressModule } from "./progress/progress.module.js";
import { NutritionModule } from "./nutrition/nutrition.module.js";
import { AiModule } from "./ai/ai.module.js";
import { QrModule } from "./qr/qr.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
    }),
    PrismaModule,
    AuthModule,
    ClientsModule,
    ExercisesModule,
    RoutinesModule,
    ProgressModule,
    NutritionModule,
    AiModule,
    QrModule,
  ],
})
export class AppModule {}
