import { Injectable } from '@nestjs/common';
import { CallTicketDto, CreatePendingSampleDto, EndServiceTicketDto, NextPatientDto, printLabelsDto } from './dto/create-pending-sample.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { FOURD_SERVICE_CONNECTION } from 'src/database/database.constants';
import { DataSource } from 'typeorm';
import { VENTANILLA } from 'src/common/4DSERVICE/entities/ventanilla.entity';
import { TICKET } from 'src/common/4DSERVICE/entities/ticket.entity';

@Injectable()
export class PendingSamplesService {

  constructor(
    @InjectDataSource(FOURD_SERVICE_CONNECTION)
    private readonly FourDServiceSource: DataSource
  ) { }


  async pendingPatients(createPendingSampleDto: CreatePendingSampleDto) {
    const { stage, service } = createPendingSampleDto;

    const quantity = await this.FourDServiceSource.query(
      `EXEC dbo.TicketEnEspera
        @servicio = @0,
        @etapa = @1`,
      [service, stage],
    );

    return quantity;
  }

  async nextPatient(nextPatient: NextPatientDto) {
    const {service, stage, window, user} = nextPatient
    const nextTicket = await this.FourDServiceSource.query(
      `EXEC dbo.TicketAtender
        @servicio = @0,
        @etapa = @1,
        @ventanilla = @2,
        @usuario = @3`,
      [service, stage, window, user],
    );

    return nextTicket;
  }

  async ticketWindow(id: number) {
    return await this.FourDServiceSource
    .createQueryBuilder()
    .select(['t.name', 't.currentTicket', 't.parameters'])
    .from(VENTANILLA, 't')
    .where('ventanilla = :id', {id})
    .getOne();
  }

  async currentTicket(currentTicket: number){
    return await this.FourDServiceSource
    .createQueryBuilder()
    .select([`Serie+convert(varchar, correlativo) as Numero, paciente`])
    .from(TICKET, 't')
    .where('Ticket = :currentTicket', {currentTicket})
    .getRawOne()
  }

  async endTicket(dataTicket: EndServiceTicketDto){
    const {ticket, window, stage} = dataTicket

    return await this.FourDServiceSource
    .query(
      `EXEC dbo.TicketFinalizar
      @Ticket = @0,
      @Ventanilla = @1,
      @Etapa = @2
      `,
      [ticket, window, stage]
    )
  }

  async callTicket(callDto: CallTicketDto){
    const {ticket, window} = callDto;

    return await this.FourDServiceSource
    .query(
      `EXEC dbo.TicketVocear
      @Ticket = @0,
      @Ventanilla = @1
      `,
      [ticket, window]
    )
  }

  async printLabels(printDto: printLabelsDto){
    const {ticket, window} = printDto;

    return await this.FourDServiceSource
    .query(
      `EXEC dbo.ImprimirEtiqueta
      @Ticket = @0,
      @Ventanilla = @1`,
      [ticket, window]
    )
  }
}
