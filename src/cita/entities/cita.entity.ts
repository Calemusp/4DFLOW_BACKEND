import { ApiPropertyOptional } from '@nestjs/swagger';

export class Cita {
  @ApiPropertyOptional({ description: 'ID de la cita', example: 1 })
  id?: number;
}
