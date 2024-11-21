import { Module } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ZalopayController } from './zalopay.controller';
import { WalletDepositModule } from '../wallet-deposit/wallet-deposit.module';

@Module({
  imports: [WalletDepositModule],
  controllers: [ZalopayController],
  providers: [ZalopayService],
})
export class ZalopayModule {}
