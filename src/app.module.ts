import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './modules/authentication/auth.module';
import { UsersModule } from './modules/users/users.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { ComicModule } from './modules/comics/comics.module';
import { GenreModule } from './modules/genres/genre.module';
import { PermissionsGuard } from './modules/authorization/permission.guard';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { ZalopayModule } from './modules/zalopay/zalopay.module';
import { VnpayModule } from './modules/vnpay/vnpay.module';
import { VietNamAddressModule } from './modules/viet-nam-address/viet-nam-address.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UserAddressesModule } from './modules/user-addresses/user-addresses.module';
import { OtpModule } from './modules/otps/otps.module';
import { SellerDetailsModule } from './modules/seller-details/seller-details.module';
import { WalletDepositModule } from './modules/wallet-deposit/wallet-deposit.module';
import { WithdrawalModule } from './modules/withdrawal/withdrawal.module';
import { SourcesOfFundModule } from './modules/sources-of-fund/sources-of-fund.module';
import { SellerSubscriptionsModule } from './modules/seller-subscriptions/seller-subscriptions.module';
import { SellerSubsPlansModule } from './modules/seller-subs-plans/seller-subs-plans.module';
import { PlansModule } from './modules/exchange-subs/plans/plans.module';
import { EventsModule } from './modules/socket/event.module';
import { AuctionModule } from './modules/auction/auction.module';
import { DepositsModule } from './modules/deposits/deposits.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { ChatRoomsModule } from './modules/chat-rooms/chat-rooms.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/entities/**/*.entity.js')],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    EventsModule,
    AuctionModule,
    AuthModule,
    UsersModule,
    ComicModule,
    GenreModule,
    FileUploadModule,
    NotificationsModule,
    OrdersModule,
    OrderItemsModule,
    VnpayModule,
    ZalopayModule,
    VietNamAddressModule,
    TransactionsModule,
    ExchangesModule,
    UserAddressesModule,
    OtpModule,
    SellerDetailsModule,
    WalletDepositModule,
    WithdrawalModule,
    SourcesOfFundModule,
    SellerSubscriptionsModule,
    SellerSubsPlansModule,
    PlansModule,
    DepositsModule,
    ChatRoomsModule,
    ChatMessagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: 'PERMISSION_GUARD',
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
