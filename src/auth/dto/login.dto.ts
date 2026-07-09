import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jperez' })
  @IsString()
  @MinLength(1)
  usuario!: string;

  @ApiProperty({ example: 'miClave123' })
  @IsString()
  @MinLength(1)
  contraseña!: string;

  @ApiProperty({ example: 8, description: 'Id de la ventanilla seleccionada' })
  @IsNumber()
  @IsPositive()
  ventanilla!: number;
}
