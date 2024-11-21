import { Module } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { VnpayController } from './vnpay.controller';
import { WalletDepositModule } from '../wallet-deposit/wallet-deposit.module';

@Module({
  imports: [WalletDepositModule],
  controllers: [VnpayController],
  providers: [VnpayService],
})
export class VnpayModule {}
