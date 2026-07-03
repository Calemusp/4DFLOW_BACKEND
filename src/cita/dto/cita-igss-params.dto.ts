import { ApiProperty } from '@nestjs/swagger';

/**
 * Documentación Swagger del parámetro del endpoint IGSS.
 */
export class CitaIgssParamsDto {
  @ApiProperty({
    example: '123456789',
    description: 'Número de orden del servicio Medi-IGSS',
  })
  noOrden: string;
}
