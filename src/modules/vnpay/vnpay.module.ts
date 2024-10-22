import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [TransactionsModule, WalletsModule],
  controllers: [VnpayController],
  providers: [VnpayService],
})
export class VnpayModule {}
