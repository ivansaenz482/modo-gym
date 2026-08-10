import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AiService } from "./ai.service.js";
import { GenerateRoutineDto } from "./dto/generate-routine.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator.js";

@ApiTags("ai")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("ai")
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post("routine")
  generateRoutine(@CurrentUser() user: AuthUser, @Body() dto: GenerateRoutineDto) {
    return this.ai.generateRoutine(user.id, dto);
  }

  @Post("nutrition")
  generateNutrition(@CurrentUser() user: AuthUser) {
    return this.ai.generateNutrition(user.id);
  }
}
