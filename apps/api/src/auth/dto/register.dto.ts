import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "cliente@modogym.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "cliente123" })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;

  @ApiProperty({ example: "Cliente Demo" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ required: false, example: "0999837540" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false, enum: ["CLIENT", "ADMIN"], default: "CLIENT" })
  @IsOptional()
  @IsIn(["CLIENT", "ADMIN"])
  role?: "CLIENT" | "ADMIN";
}
