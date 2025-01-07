import { Module } from '@nestjs/common';
import { ConditionsService } from './conditions.service';
import { ConditionsController } from './conditions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condition } from 'src/entities/condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Condition])],
  controllers: [ConditionsController],
  providers: [ConditionsService],
  exports: [ConditionsService],
})
export class ConditionsModule {}
