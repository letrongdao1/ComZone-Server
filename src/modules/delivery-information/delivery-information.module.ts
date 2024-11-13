import { Module } from '@nestjs/common';
import { DeliveryInformationService } from './delivery-information.service';
import { DeliveryInformationController } from './delivery-information.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryInformation } from 'src/entities/delivery-information.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryInformation]), UsersModule],
  controllers: [DeliveryInformationController],
  providers: [DeliveryInformationService],
  exports: [DeliveryInformationService],
})
export class DeliveryInformationModule {}
