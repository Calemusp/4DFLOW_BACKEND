import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, Min } from 'class-validator';

export class TicketCrearDto {
  @ApiProperty({
    description: 'ID del servicio en 4DSERVICE',
    example: 1,
  })
  @IsNumber()
  @IsInt()
  @Min(1)
  service!: number;

  @ApiProperty({
    description: 'Indica si el ticket es especial',
    example: false,
  })
  @IsBoolean()
  especial!: boolean;
}
