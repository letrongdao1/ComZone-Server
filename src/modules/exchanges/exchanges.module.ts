import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';

@Module({
  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule {}
