import { Module } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ZalopayController } from './zalopay.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [TransactionsModule],
  controllers: [ZalopayController],
  providers: [ZalopayService],
})
export class ZalopayModule {}
