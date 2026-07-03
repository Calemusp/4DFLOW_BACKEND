import { Module } from '@nestjs/common';
import { PendingSamplesService } from './pending-samples.service';
import { PendingSamplesController } from './pending-samples.controller';
import { PendingSamplesGateway } from './pending-samples.gateway';

@Module({
  controllers: [PendingSamplesController],
  providers: [PendingSamplesService, PendingSamplesGateway],
  exports: [PendingSamplesGateway],
})
export class PendingSamplesModule {}
