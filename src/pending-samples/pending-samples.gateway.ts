import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreatePendingSampleDto } from './dto/create-pending-sample.dto';
import { PendingSamplesService } from './pending-samples.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/pending-samples',
})
export class PendingSamplesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PendingSamplesGateway.name);

  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly pendingSamplesService: PendingSamplesService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('pending:refresh')
  async handleRefresh(
    @MessageBody() payload: CreatePendingSampleDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const data = await this.pendingSamplesService.pendingPatients(payload);
      this.server.emit('pending:update', data);
      return { ok: true, data };
    } catch (error) {
      this.logger.error('Error al ejecutar TicketEnEspera', error);
      client.emit('pending:error', {
        message: 'No fue posible obtener los tickets en espera',
      });
      return { ok: false };
    }
  }

  async broadcastPending(payload: CreatePendingSampleDto): Promise<void> {
    const data = await this.pendingSamplesService.pendingPatients(payload);
    this.server.emit('pending:update', data);
  }
}
