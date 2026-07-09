import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateCitaIgssBodyDto {
  @ApiProperty({
    description: 'ID del servicio en 4DSERVICE',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  service: number;

  @ApiProperty({
    description: 'Prioridad del ticket',
    example: 0,
  })
  @IsNumber()
  @IsInt()
  @Min(0)
  priority: number;
}
