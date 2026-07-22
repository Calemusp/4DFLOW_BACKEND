import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CITA } from 'src/common/4DLAB/entities/cita.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  FOURD_LAB_CONNECTION,
  FOURD_SERVICE_CONNECTION,
} from 'src/database/database.constants';
import { UsersDefault } from 'src/common/typescript/enums/ticket-category.enum';
import { handleStoredProcedureError } from 'src/common/utils/sql-server-error.util';
import { TICKET } from 'src/common/4DSERVICE/entities/ticket.entity';
import { SERVICIO } from 'src/common/4DSERVICE/entities/servicio.entity';
import { CreateTicketDto } from './dto/create-create-ticket.dto';
import { TicketCrearDto } from './dto/ticket-crear.dto';
import { TEMP_PACIENTES_IGSS } from 'src/common/4DSERVICE/entities/temp-pacientes-igss.entity';

const TICKET_CREAR_TIPO_ORDEN = '0';
const TICKET_CREAR_ORDEN = '0';

@Injectable()
export class CreateTicketService {

  constructor(
    @InjectDataSource(FOURD_LAB_CONNECTION)
    private readonly FourDLabsource: DataSource,
    @InjectDataSource(FOURD_SERVICE_CONNECTION)
    private readonly FourDServiceSource: DataSource,
  ) {

  }


  async findAppointments(appointmentId: number) {
    const appointmentReference = String(appointmentId);

    return await this.FourDLabsource
      .createQueryBuilder()
      .select([
        'c.cita',
        'c.tipoOrden',
        'c.orden',
        'c.vigente',
        'c.asignada',
      ])
      .from(CITA, 'c')
      .where('c.cita = :cita', { cita: appointmentId })
      .orWhere('c.referenciaCita = :referenciaCita', {
        referenciaCita: appointmentReference,
      })
      .getRawOne();
  }

  async convertToOrder(appointmentId: CreateTicketDto){

    const appointment = await this.findAppointments(appointmentId.appointmentId);

    if(!appointment){
      throw new NotFoundException('Cita no encontrada');
    }

    try{
      const convert = await this.FourDLabsource.query(
        `EXECUTE [dbo].[sp_convert_cita_orden] @cita = @0, @usuario = @1, @equipo = @2`,
        [
          appointmentId.appointmentId,
          UsersDefault.USUARIO_DEFAULT,
          UsersDefault.EQUIPO_DEFAULT,
        ],
      );

      const appointmentOrder = convert[0].orden_cita;


      if(!appointmentOrder){
        throw new NotFoundException('Orden no encontrada');
      }

      const createTicket = await this.FourDServiceSource.query(
        `EXECUTE [dbo].[TicketCrear] @servicio = @0, @Especial = @1, @tipoOrden = @2, @orden = @3`,
        [
          1,
          0,
          1,
          appointmentOrder
        ]
      )

      const ticketId = createTicket[0].ticketId;
      if(!ticketId){
        throw new NotFoundException('No insertó el ticket');
      }

      const ticketDetaild = await this.findTicketById(ticketId);

      return ticketDetaild;

    } catch (error) {
      handleStoredProcedureError(error, 'Error al convertir la cita a orden');
    }

  }

  async ticketCreate(dto: TicketCrearDto) {
    console.log(dto);
    try {
      const createTicket = await this.FourDServiceSource.query(
        `EXECUTE [dbo].[TicketCrear] @servicio = @0, @Especial = @1, @tipoOrden = @2, @orden = @3`,
        [
          dto.service,
          dto.especial ? 1 : 0,
          TICKET_CREAR_TIPO_ORDEN,
          TICKET_CREAR_ORDEN,
        ],
      );

      const ticketId = createTicket[0]?.ticketId;
      if (!ticketId) {
        throw new NotFoundException('No insertó el ticket');
      }

      return await this.findTicketById(ticketId);
    } catch (error) {
      handleStoredProcedureError(error, 'Error al crear el ticket');
    }
  }

  //! pending refactor
  async findTicketById(ticketId: number) {
    return await this.FourDServiceSource.createQueryBuilder()
      .select([
        `CONCAT(T.Serie, T.Correlativo) as numeroTicket`,
        'S.Descripcion as descripcion',
        `Format(T.Fecha, 'dd/MM/yyyy HH:mm:ss') as fecha`,
        //'T.Paciente as paciente',
        //'tp.id_orden as idOrden',
        //'t.orden'
      ])
      .from(TICKET, 'T')
      .innerJoin(SERVICIO, 'S', 'T.Servicio = S.Servicio')
      //.leftJoin(TEMP_PACIENTES_IGSS, 'tp', 'T.ticket = TP.tiket')
      .where('T.Ticket = :ticketId', { ticketId })
      .getRawOne();
  }

  async findServices() {
    return await this.FourDServiceSource.createQueryBuilder()
      .select([
        'S.Servicio',
        'S.Descripcion',
        'S.Serie'
      ])
      .from(SERVICIO, 'S')
      .getRawMany();
  }
}
