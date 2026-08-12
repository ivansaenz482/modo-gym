-- DropIndex
DROP INDEX "RoutineExercise_routineId_exerciseId_order_key";

-- AlterTable
ALTER TABLE "NutritionPlan" ADD COLUMN     "days" JSONB;

-- AlterTable
ALTER TABLE "RoutineExercise" ADD COLUMN     "day" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "RoutineExercise_routineId_day_order_key" ON "RoutineExercise"("routineId", "day", "order");
