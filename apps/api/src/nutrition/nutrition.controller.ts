import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { NutritionService } from "./nutrition.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator.js";

@ApiTags("nutrition")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("nutrition")
export class NutritionController {
  constructor(private readonly nutrition: NutritionService) {}

  @Get("mine")
  findMine(@CurrentUser() user: AuthUser) {
    return this.nutrition.findMine(user.id);
  }
}
