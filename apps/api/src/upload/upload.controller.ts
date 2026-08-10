import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { randomUUID } from "node:crypto";
import { extname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { UploadService } from "./upload.service.js";

const UPLOADS_DIR = join(process.cwd(), "uploads");

@ApiTags("upload")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("upload")
export class UploadController {
  constructor(private readonly uploads: UploadService) {}

  @Post()
  @Roles("ADMIN")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(UPLOADS_DIR, { recursive: true });
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const base = file.originalname.replace(/[^\w.\-]+/g, "_").replace(/\.[^.]+$/, "");
          const safe = base.slice(-40) || "archivo";
          cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}-${safe}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: "Subir imagen o video (admin)" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploads.save(file);
  }
}
