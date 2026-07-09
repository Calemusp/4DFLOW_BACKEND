import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envConfig } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { CitaModule } from './cita/cita.module';
import { CreateTicketModule } from './create-ticket/create-ticket.module';
import { PendingSamplesModule } from './pending-samples/pending-samples.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    DatabaseModule,
    CitaModule,
    CreateTicketModule,
    PendingSamplesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
