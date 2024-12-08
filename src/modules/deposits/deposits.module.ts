import { forwardRef, Module } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deposit } from 'src/entities/deposit.entity';
import { UsersModule } from '../users/users.module';
import { AuctionModule } from '../auction/auction.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deposit]),
    UsersModule,
    forwardRef(() => AuctionModule),
    forwardRef(() => ExchangesModule),
    TransactionsModule,
  ],
  controllers: [DepositsController],
  providers: [DepositsService],
  exports: [DepositsService],
})
export class DepositsModule {}
