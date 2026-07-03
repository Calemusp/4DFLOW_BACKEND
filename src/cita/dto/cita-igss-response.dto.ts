import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CitaEtiquetaRespuestaDto {
  @ApiProperty({ example: '123456789', description: 'Número de orden IGSS' })
  noOrden: string;

  @ApiProperty({ example: 227746, description: 'ID interno de la cita en 4DLAB' })
  referenciaCita: number;

  @ApiProperty({ example: 'Juan' })
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  primerApellido: string;

  @ApiProperty({ example: 'López' })
  segundoApellido: string;

  @ApiProperty({ example: '19876543210', description: 'Número de afiliación' })
  afiliacion: string;

  @ApiProperty({ example: '1980/05/15' })
  fechaNacimiento: string;

  @ApiProperty({ example: 'M' })
  sexo: string;

  @ApiProperty({ example: '50212345678' })
  telefono: string;

  @ApiProperty({ example: '19/06/2026 - 08:00 AM' })
  fechaProximaCita: string;

  @ApiProperty({ example: '12345', description: 'Código de colegiado del médico' })
  colegiadoMedico: string;

  @ApiProperty({ example: 'Dr. García' })
  nombreMedico: string;

  @ApiProperty({ example: '0', description: 'Tipo de orden (1 = ya convertida a orden)' })
  tipoOrden: string;
}

export class CitaIgssReferenciaResponseDto {
  @ApiProperty({ type: CitaEtiquetaRespuestaDto })
  respuesta: CitaEtiquetaRespuestaDto;

  @ApiProperty({ example: 'CITA_RP_200' })
  codigo: string;
}

export class CitaIgssReimpresionResponseDto extends CitaIgssReferenciaResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica que la cita ya existía y se devuelve para reimpresión',
  })
  reimpresion: boolean;
}

export class CitaIgssErrorResponseDto {
  @ApiProperty({ example: 404, description: 'Código HTTP del error' })
  statusCode: number;

  @ApiProperty({
    example: 'La orden de Medi-IGSS no existe',
    description: 'Mensaje descriptivo del error',
  })
  message: string;

  @ApiPropertyOptional({
    example: 'CITA_CONVERTIDA',
    description: 'Código interno del error de negocio',
  })
  codigo?: string;

  @ApiPropertyOptional({ example: true })
  error?: boolean;
}
