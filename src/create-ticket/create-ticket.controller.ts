import { Controller, Get, Body, Patch, Param, Delete, Query, ParseIntPipe, Post } from '@nestjs/common';
import { CreateTicketService } from './create-ticket.service';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTicketDto } from './dto/create-create-ticket.dto';
import { TicketCrearDto } from './dto/ticket-crear.dto';

@ApiTags('create-ticket')
@Controller('create-ticket')
export class CreateTicketController {
  constructor(private readonly createTicketService: CreateTicketService) { }

  @Get('appointment')
  @ApiOperation({
    summary: 'Buscar cita por ID o referencia',
  })
  @ApiQuery({
    name: 'appointmentId',
    required: true,
    type: Number,
    example: 227746,
  })
  findAll(@Query('appointmentId', ParseIntPipe) appointmentId: number) {
    return this.createTicketService.findAppointments(appointmentId);
  }

  @Post()
  @ApiOperation({
    summary: 'Crear ticket desde cita',
  })
  @ApiBody({ type: CreateTicketDto })
  create(@Body() createCreateTicketDto: CreateTicketDto) {
    return this.createTicketService.convertToOrder(createCreateTicketDto);
  }

  @Post('ticket')
  @ApiOperation({
    summary: 'Crear ticket con TicketCrear (sin orden)',
    description:
      'Ejecuta [dbo].[TicketCrear] en 4DSERVICE. tipoOrden y orden se envían siempre como 0.',
  })
  @ApiBody({ type: TicketCrearDto })
  ticketCreate(@Body() ticketCrearDto: TicketCrearDto) {
    return this.createTicketService.ticketCreate(ticketCrearDto);
  }
  @Get('services')
  @ApiOperation({
    summary: 'Buscar servicios',
  })
  findServices() {
    return this.createTicketService.findServices();
  }

  @Get('ticket/:ticketId')
  @ApiOperation({
    summary: 'Buscar ticket por ID',
  })
  @ApiParam({
    name: 'ticketId',
    required: true,
    type: Number,
    example: 248407,
  })
  findTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.createTicketService.findTicketById(ticketId);
  }





}
