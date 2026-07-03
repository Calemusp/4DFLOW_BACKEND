import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCitaIgssDto {
  @ApiProperty({ example: '123456789', description: 'Número de orden IGSS' })
  @IsString()
  @IsNotEmpty()
  noOrden: string;
}
