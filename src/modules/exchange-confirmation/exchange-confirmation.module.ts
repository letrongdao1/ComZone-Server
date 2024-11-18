import { Module } from '@nestjs/common';
import { ExchangeConfirmationService } from './exchange-confirmation.service';
import { ExchangeConfirmationController } from './exchange-confirmation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeConfirmation]),
    ExchangesModule,
    UsersModule,
  ],
  controllers: [ExchangeConfirmationController],
  providers: [ExchangeConfirmationService],
  exports: [ExchangeConfirmationService],
})
export class ExchangeConfirmationModule {}
