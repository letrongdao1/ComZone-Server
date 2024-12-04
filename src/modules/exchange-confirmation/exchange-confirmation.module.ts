import { Module } from '@nestjs/common';
import { ExchangeConfirmationService } from './exchange-confirmation.service';
import { ExchangeConfirmationController } from './exchange-confirmation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { UsersModule } from '../users/users.module';
import { DepositsModule } from '../deposits/deposits.module';
import { ExchangeComicsModule } from '../exchange-comics/exchange-comics.module';
import { EventsModule } from '../socket/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeConfirmation]),
    UsersModule,
    ExchangesModule,
    ExchangeComicsModule,
    DepositsModule,
    EventsModule,
  ],
  controllers: [ExchangeConfirmationController],
  providers: [ExchangeConfirmationService],
  exports: [ExchangeConfirmationService],
})
export class ExchangeConfirmationModule {}
