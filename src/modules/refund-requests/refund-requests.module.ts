import { Module } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { RefundRequestsController } from './refund-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { Order } from 'src/entities/orders.entity';
import { Exchange } from 'src/entities/exchange.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundRequest, Order, Exchange]),
    UsersModule,
  ],
  controllers: [RefundRequestsController],
  providers: [RefundRequestsService],
  exports: [RefundRequestsService],
})
export class RefundRequestsModule {}
