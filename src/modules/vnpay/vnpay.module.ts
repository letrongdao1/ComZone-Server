import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [VnpayController],
  providers: [VnpayService],
})
export class VnpayModule {}
