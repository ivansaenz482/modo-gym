import { BadRequestException, Injectable } from "@nestjs/common";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"],
]);

const MAX_SIZE = 50 * 1024 * 1024;

@Injectable()
export class UploadService {
  private readonly dir = join(process.cwd(), "uploads");

  async save(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Envíe un archivo en el campo 'file'");
    }

    const ext = ALLOWED.get(file.mimetype);
    if (!ext) {
      await this.remove(file.filename);
      throw new BadRequestException(
        "Solo se permiten imágenes (jpg, png, webp, gif) o videos (mp4, webm, mov)",
      );
    }

    if (file.size > MAX_SIZE) {
      await this.remove(file.filename);
      throw new BadRequestException("El archivo supera el máximo de 50 MB");
    }

    return {
      url: `/api/uploads/${file.filename}`,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  private remove(filename: string) {
    return unlink(join(this.dir, filename)).catch(() => {});
  }
}
