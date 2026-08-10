import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ClientsService } from "./clients.service.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { CurrentUser, AuthUser } from "../auth/current-user.decorator.js";

@ApiTags("clients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("clients")
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  @Roles("ADMIN")
  findAll() {
    return this.clients.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.clients.findOne(id, user.id, user.role);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.clients.updateProfile(id, user.id, user.role, dto);
  }
}
