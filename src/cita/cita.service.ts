import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CITA } from 'src/common/4DLAB/entities/cita.entity';
import { CAT_MEDICO } from 'src/common/4DLAB/entities/cat-medico.entity';
import { ORDEN } from 'src/common/4DLAB/entities/orden.entity';
import { base64FotografiaToBuffer } from 'src/common/utils/fotografia.util';
import { getSqlServerErrorMessage, handleStoredProcedureError } from 'src/common/utils/sql-server-error.util';
import {
  cleanArrayValues,
  sanitizeStrings,
} from 'src/common/utils/sanitize.util';
import { TICKET } from 'src/common/4DSERVICE/entities/ticket.entity';
import { SERVICIO } from 'src/common/4DSERVICE/entities/servicio.entity';
import {
  FOURD_LAB_CONNECTION,
  FOURD_SERVICE_CONNECTION,
} from 'src/database/database.constants';
import { UsersDefault } from 'src/common/typescript/enums/ticket-category.enum';
import { IgssSoapService } from 'src/igss/igss-soap.service';
import { isIgssOrderError } from 'src/igss/igss.types';

import {
  DataEtiquetaResult,
  isDataEtiquetaConflict,
} from './types/data-etiqueta.types';
import { parseSpCreacionOrden4dflowResult } from './types/sp-creacion-orden.types';
import { CreateCitaIgssBodyDto } from './dto/create-cita-igss.dto';
import { TEMP_PACIENTES_IGSS } from 'src/common/4DSERVICE/entities/temp-pacientes-igss.entity';

const PROCESS_TIMEOUT_MS = 20000;

@Injectable()
export class CitaService {
  private readonly logger = new Logger(CitaService.name);

  constructor(
    @InjectDataSource(FOURD_LAB_CONNECTION)
    private readonly fourDLabSource: DataSource,
    @InjectDataSource(FOURD_SERVICE_CONNECTION)
    private readonly fourDServiceSource: DataSource,
    private readonly igssSoapService: IgssSoapService,
  ) {}

  async createFromIgssOrder(noOrden: string, body: CreateCitaIgssBodyDto) {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), PROCESS_TIMEOUT_MS);
    });

    try {
      return await Promise.race([
        this.processIgssOrder(noOrden, body),
        timeoutPromise,
      ]);
    } catch (error: unknown) {
      return this.handleCreateCitaError(error);
    }
  }

  
  consultarMediIgss(noOrden: string) {
    return this.igssSoapService.consultarOrdenDebug(noOrden);
  }


  private async processIgssOrder(
    noOrden: string,
    { service, priority }: CreateCitaIgssBodyDto,
  ) {
    const fecha = new Date().toISOString().slice(0, 10);
    const usuario = UsersDefault.USUARIO_DEFAULT;
    const grupo = null;

    //!LOGICA DE CITA EXISTENTE
   // const existeCita = await this.evaluateCita(noOrden);
   // if (existeCita) {
   //   const referenciaCita = await this.dataEtiqueta(noOrden);
   //   this.throwIfDataEtiquetaConflict(referenciaCita);

   //   return {
   //     reimpresion: true,
   //     ...referenciaCita,
   //   };
   // }

    //console.log('noOrden', noOrden);
    const data = await this.igssSoapService.consultarOrden(noOrden);
    //console.log('data', data);
    
    if (isIgssOrderError(data)) {
      throw new HttpException(
        { statusCode: data.code, message: data.message },
        data.code,
      );
    }

    const info = sanitizeStrings(cleanArrayValues(data));

    const detalles = Array.isArray(info.DETALLE)
      ? info.DETALLE
      : info.DETALLE
        ? [info.DETALLE]
        : [];

    const codigosExamen = detalles
      .map((item) => item.CODIGO_EXAMEN)
      .filter(Boolean)
      .join(',');

    const codigoServicio =
      info.SOLICITUD?.CODIGO_SERVICIO?.match(/\d+\.[A-Za-z]+\.(\d+)$/)?.[1] ??
      '404';

    const fotoBuffer = base64FotografiaToBuffer(info.RESPUESTA?.FOTOGRAFIA);

    const columns = [
      '[id_orden]',
      '[fecha_orden]',
      '[afiliacion]',
      '[nombre]',
      '[primerApellido]',
      '[segundoApellido]',
      '[sexo]',
      '[fechaNacimiento]',
      '[TipoPaciente]',
      '[TipoPrograma]',
      '[servicio]',
      '[codigo_medico]',
      '[pruebas]',
      '[telefono]',
      '[direccion]',
      '[usuario]',
      '[medico]',
      '[grupo_cita]',
    ];
    const values: unknown[] = [
      noOrden,
      fecha,
      info.RESPUESTA?.NUMERO_AFILIADO ?? '',
      info.RESPUESTA?.NOMBRES ?? '',
      info.RESPUESTA?.PRIMER_APELLIDO ?? '',
      info.RESPUESTA?.SEGUNDO_APELLIDO ?? '',
      info.RESPUESTA?.SEXO_AFILIADO ?? '',
      info.RESPUESTA?.FECHA_NACIMIENTO ?? '',
      info.RESPUESTA?.TIPO_DERECHOHABIENTE ?? '',
      info.RESPUESTA?.COD_PROGRAMA ?? '',
      codigoServicio,
      info.SOLICITUD?.COLEGIADO_MEDICO ?? '',
      codigosExamen,
      info.RESPUESTA?.TELEFONO ?? '',
      'Guatemala',
      usuario,
      info.SOLICITUD?.NOMBRE_MEDICO ?? '',
      grupo,
    ];

    if (fotoBuffer) {
      columns.push('[foto]');
      values.push(fotoBuffer);
    }

    columns.push('[service]');
    values.push(service);

    columns.push('[prioridad]');
    values.push(priority);

    const placeholders = values.map((_, index) => `@${index}`);

    try{
    await this.fourDLabSource.query(
      `INSERT INTO [dbo].[temp_ordenes_igss] (${columns.join(', ')})
       VALUES (${placeholders.join(', ')})`,
      values,
    );
  } catch (error) {
    const sqlMessage = getSqlServerErrorMessage(error) ?? '';
    const isDuplicate =
      sqlMessage.includes('UQ__temp_ord') ||
      sqlMessage.includes('Violation of UNIQUE KEY') ||
      sqlMessage.includes('Cannot insert duplicate key') ||
      (error as { number?: number })?.number === 2627;
    if (isDuplicate) {
      throw new ConflictException({
        statusCode: 409,
        message: `La orden ya existe. ID Orden: ${noOrden}`,
        codigo: 'ORDEN_YA_EXISTE',
      });
    }
    handleStoredProcedureError(error, 'Error al registrar la orden temporal.');
  }
    let spResult: unknown;

    try {
      spResult = await this.fourDLabSource.query(
        `EXEC sp_creacion_orden_4dflow @0`,
        [noOrden],
      );
    } catch (error) {
      handleStoredProcedureError(
        error,
        'Error en Procedimiento Almacenado, Reintente.',
      );
    }

    const spRow = parseSpCreacionOrden4dflowResult(spResult);

    this.logger.log('Respuesta del SP', spRow);

    if (!spRow || spRow.Resultado !== 0) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message:
          spRow?.Mensaje ?? 'Error en Procedimiento Almacenado, Reintente.',
      });
    }

    const ticket = await this.findTicketByOrden(spRow.OrdenCreada);

    if (!ticket?.numeroTicket) {
      throw new InternalServerErrorException({
        statusCode: 500,
        message: 'No se pudo obtener el ticket creado.',
      });
    }

    return {
      numeroTicket: ticket.numeroTicket,
      descripcion: ticket.descripcion ?? '',
      fecha: ticket.fecha ?? '',
      paciente: ticket.paciente ?? '',
      OrdenIGSS: ticket.OrdenIGSS ?? '',
      OrdenLab: ticket.OrdenLab ?? '',
    };
  }

  private async findTicketByOrden(ordenCreada: string) {
    return this.fourDServiceSource
      .createQueryBuilder()
      .select([
        `CONCAT(T.Serie, T.Correlativo) as numeroTicket`,
        'S.Descripcion as descripcion',
        `FORMAT(T.Fecha, 'dd/MM/yyyy HH:mm:ss') as fecha`,
        'T.Paciente as paciente',
        'tp.id_orden as OrdenIGSS',
        'T.orden as OrdenLab'
      ])
      .from(TICKET, 'T')
      .innerJoin(SERVICIO, 'S', 'T.Servicio = S.Servicio')
      .leftJoin(TEMP_PACIENTES_IGSS, 'tp', 'T.ticket = tp.tiket')
      .where('T.tipoOrden = :tipoOrden', { tipoOrden: '1' })
      .andWhere('T.Orden = :orden', { orden: ordenCreada })
      .orderBy('T.Ticket', 'DESC')
      .getRawOne<{
        numeroTicket: string;
        descripcion: string;
        fecha: string;
        paciente: string;
        OrdenIGSS: string;
        OrdenLab: string;
      }>();
  }
/** 
  private async evaluateCita(noOrden: string): Promise<boolean> {
    this.logger.log('Evaluando cita existente');

    const cita = await this.fourDLabSource.getRepository(CITA).findOne({
      where: { appointmentReference: noOrden },
      select: { appointmentId: true },
    });

    this.logger.log(cita);

    return !!cita;
  }*/

  private async dataEtiqueta(noOrden: string): Promise<DataEtiquetaResult> {
    this.logger.log('Consultando dataEtiqueta');

    const respuesta = await this.fourDLabSource
      .getRepository(CITA)
      .createQueryBuilder('C')
      .select([
        'C.referenciaCita AS noOrden',
        'C.cita as referenciaCita',
        'O.nombre AS nombre',
        'O.primerApellido AS primerApellido',
        'O.segundoApellido AS segundoApellido',
        'O.paciente AS afiliacion',
        "FORMAT(O.fechaNacimiento, 'yyyy/MM/dd') AS fechaNacimiento",
        'O.sexo AS sexo',
        'O.telefono AS telefono',
        "FORMAT(C.fechaCita, 'dd/MM/yyyy - hh:mm tt') AS fechaProximaCita",
        'M.medico AS colegiadoMedico',
        'M.nombre AS nombreMedico',
        'C.tipoOrden AS tipoOrden',
      ])
      .innerJoin(ORDEN, 'O', 'C.orden = O.Orden AND C.tipoOrden = O.tipoOrden')
      .leftJoin(CAT_MEDICO, 'M', 'O.codigoMedico = M.medico')
      .where('C.referenciaCita = :noOrden', { noOrden })
      .getRawOne<{
        noOrden: string;
        referenciaCita: number;
        nombre: string;
        primerApellido: string;
        segundoApellido: string;
        afiliacion: string;
        fechaNacimiento: string;
        sexo: string;
        telefono: string;
        fechaProximaCita: string;
        colegiadoMedico: string;
        nombreMedico: string;
        tipoOrden: string;
      }>();

    if (!respuesta) {
      return null;
    }

    if (respuesta.tipoOrden === '1') {
      return {
        error: true,
        statusCode: 409,
        message:
          'La cita ya fue convertida a orden y no puede ser utilizada nuevamente',
        codigo: 'CITA_CONVERTIDA',
      };
    }

    return {
      respuesta,
      codigo: 'CITA_RP_200',
    };
  }

  private throwIfDataEtiquetaConflict(result: DataEtiquetaResult): void {
    if (isDataEtiquetaConflict(result)) {
      throw new HttpException(
        {
          error: result.error,
          statusCode: result.statusCode,
          message: result.message,
          codigo: result.codigo,
        },
        result.statusCode,
      );
    }
  }

  private handleCreateCitaError(error: unknown): never {
    const err = error as NodeJS.ErrnoException & { message?: string };

    this.logger.error('[CREATE ORDER ERROR]', {
      message: err?.message,
      code: err?.code,
    });

    if (error instanceof HttpException) {
      throw error;
    }

    if (err?.message === 'TIMEOUT') {
      throw new HttpException(
        {
          statusCode: 408,
          message:
            'La creación de la cita tardó demasiado, inténtelo nuevamente',
        },
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    if (err?.code === 'ETIMEOUT' || err?.message?.includes('timeout')) {
      throw new HttpException(
        {
          statusCode: 408,
          message:
            'La base de datos tardó demasiado en responder, inténtelo nuevamente',
        },
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    if (
      err?.code === 'ESOCKET' ||
      err?.code === 'ECONNCLOSED' ||
      err?.code === 'ENOTOPEN'
    ) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message:
          'No fue posible conectar con la base de datos, inténtelo nuevamente',
      });
    }

    throw new InternalServerErrorException({
      statusCode: 500,
      message:
        'Error interno del servidor al crear la cita, inténtelo nuevamente',
    });
  }

}
