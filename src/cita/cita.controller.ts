import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CitaService } from './cita.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import {
  CitaIgssErrorResponseDto,
  CitaIgssReferenciaResponseDto,
  CitaIgssReimpresionResponseDto,
} from './dto/cita-igss-response.dto';
import { CreateCitaIgssBodyDto } from './dto/create-cita-igss.dto';

@ApiTags('citas')
@Controller('cita')
export class CitaController {
  constructor(private readonly citaService: CitaService) {}

  @Post('igss/:noOrden')
  @ApiTags('citas-igss')
  @ApiExtraModels(
    CitaIgssReferenciaResponseDto,
    CitaIgssReimpresionResponseDto,
    CitaIgssErrorResponseDto,
  )
  @ApiParam({
    name: 'noOrden',
    description: 'Número de orden del servicio Medi-IGSS',
    example: '123456789',
  })
  @ApiBody({ type: CreateCitaIgssBodyDto })
  createFromIgss(
    @Param('noOrden') noOrden: string,
    @Body() body: CreateCitaIgssBodyDto,
  ) {
    return this.citaService.createFromIgssOrder(noOrden, body);
  }

  @Get('igss/consulta/:noOrden')
  @ApiTags('citas-igss')
  @ApiOperation({
    summary: 'Consultar orden en Medi-IGSS (debug)',
    description:
      'Consulta el servicio SOAP de Medi-IGSS y devuelve la respuesta XML cruda, el objeto parseado y el resultado mapeado. No crea cita ni escribe en base de datos.',
  })
  @ApiParam({
    name: 'noOrden',
    description: 'Número de orden del servicio Medi-IGSS',
    example: '123456789',
  })
  @ApiOkResponse({
    description: 'Respuesta completa de Medi-IGSS',
    schema: {
      example: {
        noOrden: '123456789',
        tiempoMs: 850,
        rawXml: '<?xml version="1.0" encoding="utf-8"?>...',
        parsedSoap: { 'soap:Envelope': { 'soap:Body': {} } },
        igssObject: {
          EXITO: 'TRUE',
          RESPUESTA: {
            PACIENTE: { NOMBRES: 'Juan', NUMERO_AFILIADO: '123' },
            SOLICITUD: { NOMBRE_MEDICO: 'Dr. García' },
            DETALLE: [{ CODIGO_EXAMEN: 'GLU' }],
          },
        },
        mapped: {
          RESPUESTA: { NOMBRES: 'Juan', NUMERO_AFILIADO: '123' },
          SOLICITUD: { NOMBRE_MEDICO: 'Dr. García' },
          DETALLE: [{ CODIGO_EXAMEN: 'GLU' }],
        },
      },
    },
  })
  consultarMediIgss(@Param('noOrden') noOrden: string) {
    return this.citaService.consultarMediIgss(noOrden);
  }

}
