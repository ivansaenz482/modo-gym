import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { RoutinesService } from "./routines.service.js";
import { CreateRoutineDto } from "./dto/create-routine.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator.js";

@ApiTags("routines")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("routines")
export class RoutinesController {
  constructor(private readonly routines: RoutinesService) {}

  @Get("mine")
  findMine(@CurrentUser() user: AuthUser) {
    return this.routines.findMine(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.routines.findOne(id, user.id, user.role);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRoutineDto) {
    return this.routines.create(user.id, user.id, user.role, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.routines.remove(id, user.id, user.role);
  }
}
