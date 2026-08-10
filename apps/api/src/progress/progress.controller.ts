import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ProgressService } from "./progress.service.js";
import { CreateProgressDto } from "./dto/create-progress.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator.js";

@ApiTags("progress")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("progress")
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get("mine")
  findMine(@CurrentUser() user: AuthUser) {
    return this.progress.findMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProgressDto) {
    return this.progress.create(user.id, user.id, user.role, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.progress.remove(id, user.id, user.role);
  }
}
