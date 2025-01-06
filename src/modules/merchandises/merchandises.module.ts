import { Module } from '@nestjs/common';
import { MerchandisesService } from './merchandises.service';
import { MerchandisesController } from './merchandises.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchandise } from 'src/entities/merchandise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchandise])],
  controllers: [MerchandisesController],
  providers: [MerchandisesService],
  exports: [MerchandisesService],
})
export class MerchandisesModule {}
