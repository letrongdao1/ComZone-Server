import { Module } from '@nestjs/common';
import { ZalopayService } from './zalopay.service';
import { ZalopayController } from './zalopay.controller';

@Module({
  controllers: [ZalopayController],
  providers: [ZalopayService],
})
export class ZalopayModule {}
