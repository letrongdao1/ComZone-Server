import { Module } from '@nestjs/common';
import { EditionsService } from './editions.service';
import { EditionsController } from './editions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Edition } from 'src/entities/edition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Edition])],
  controllers: [EditionsController],
  providers: [EditionsService],
  exports: [EditionsService],
})
export class EditionsModule {}
