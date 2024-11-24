import { Module } from '@nestjs/common';
import { RefundRequestsService } from './refund-requests.service';
import { RefundRequestsController } from './refund-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { SellerDetailsModule } from '../seller-details/seller-details.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundRequest]),
    UsersModule,
    OrdersModule,
    ExchangesModule,
    SellerDetailsModule,
    TransactionsModule,
  ],
  controllers: [RefundRequestsController],
  providers: [RefundRequestsService],
  exports: [RefundRequestsService],
})
export class RefundRequestsModule {}
