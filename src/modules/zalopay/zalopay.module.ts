import { Module } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ZalopayController } from './zalopay.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [TransactionsModule, WalletsModule],
  controllers: [ZalopayController],
  providers: [ZalopayService],
})
export class ZalopayModule {}
