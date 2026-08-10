import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";

@ApiTags("qr")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("qr")
export class QrController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  getQr() {
    const appDownloadUrl =
      this.config.get<string>("APP_DOWNLOAD_URL") ||
      "https://play.google.com/store/apps/details?id=com.modogym.app";
    const webUrl = this.config.get<string>("WEB_URL") || "http://localhost:5173";
    return { appDownloadUrl, webUrl };
  }
}
