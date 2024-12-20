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
import { DepositsModule } from '../deposits/deposits.module';
import { EventsModule } from '../socket/event.module';
import { Comic } from 'src/entities/comics.entity';
import { ExchangeComicsModule } from '../exchange-comics/exchange-comics.module';
import { DeliveriesModule } from '../deliveries/deliveries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundRequest, Comic]),
    UsersModule,
    OrdersModule,
    ExchangesModule,
    SellerDetailsModule,
    TransactionsModule,
    DepositsModule,
    ExchangeComicsModule,
    EventsModule,
    DeliveriesModule,
  ],
  controllers: [RefundRequestsController],
  providers: [RefundRequestsService],
  exports: [RefundRequestsService],
})
export class RefundRequestsModule {}
