import { Module } from '@nestjs/common';
import { CitaService } from './cita.service';
import { CitaController } from './cita.controller';
import { IgssModule } from 'src/igss/igss.module';

@Module({
  imports: [IgssModule],
  controllers: [CitaController],
  providers: [CitaService],
})
export class CitaModule {}
