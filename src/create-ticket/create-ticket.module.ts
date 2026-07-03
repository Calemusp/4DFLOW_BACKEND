import { Module } from '@nestjs/common';
import { CreateTicketService } from './create-ticket.service';
import { CreateTicketController } from './create-ticket.controller';

@Module({
  controllers: [CreateTicketController],
  providers: [CreateTicketService],
})
export class CreateTicketModule {}
