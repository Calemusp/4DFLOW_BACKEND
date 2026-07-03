import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { PendingSamplesService } from './pending-samples.service';
import { CallTicketDto, CreatePendingSampleDto, EndServiceTicketDto, NextPatientDto, printLabelsDto } from './dto/create-pending-sample.dto';

import { ApiOperation } from '@nestjs/swagger';

@Controller('pending-samples')
export class PendingSamplesController {
  constructor(private readonly pendingSamplesService: PendingSamplesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener los pacientes pendientes de atencion' })
  showPending(@Query() createPendingSampleDto: CreatePendingSampleDto) {
    return this.pendingSamplesService.pendingPatients(createPendingSampleDto);
  }

  @Patch('next-patient')
  @ApiOperation({ summary: 'Atender al siguiente paciente en la cola' })
  nextPatientInfo(@Body() nextPatient: NextPatientDto) {
    return this.pendingSamplesService.nextPatient(nextPatient);
  }

  @Get('window/:id')
  @ApiOperation({ summary: 'Obtener ticket actual por ventanilla' })
  currentTicketWindow(@Param('id', ParseIntPipe) id: number) {
    return this.pendingSamplesService.ticketWindow(id);
  }

  @Get('ticket/:currentTicket')
  @ApiOperation({summary: 'obtener el ticket por id'})
  getTicket(@Param('currentTicket', ParseIntPipe) currentTicket: number){
    return this.pendingSamplesService.currentTicket(currentTicket)
  }

  @Patch('endTicket')
  @ApiOperation({ summary: 'Finalizar la atencion del paciente' })
  endTicket(@Body() endTicketDto: EndServiceTicketDto){
    return this.pendingSamplesService.endTicket(endTicketDto)
  }

  @Post('callTicket')
  @ApiOperation({ summary: 'Llamar nuevamente al paciente' })
  call(@Body() callTicket: CallTicketDto){
    return this.pendingSamplesService.callTicket(callTicket)
  }

  @Post('print-labels')
  @ApiOperation({summary: 'imprimir etiquetas del paciente'})
  print(@Body() printDto: printLabelsDto){
    return this.pendingSamplesService.printLabels(printDto)
  }

}
