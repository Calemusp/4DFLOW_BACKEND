import { Module } from '@nestjs/common';
import { IgssSoapService } from './igss-soap.service';

@Module({
  providers: [IgssSoapService],
  exports: [IgssSoapService],
})
export class IgssModule {}
