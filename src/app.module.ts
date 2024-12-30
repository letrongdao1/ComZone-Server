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
import { BidModule } from './modules/bid/bid.module';
import { ChatRoomsModule } from './modules/chat-rooms/chat-rooms.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { SellerFeedbackModule } from './modules/seller-feedback/seller-feedback.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DeliveryInformationModule } from './modules/delivery-information/delivery-information.module';
import { ExchangeComicsModule } from './modules/exchange-comics/exchange-comics.module';
import { ExchangeConfirmationModule } from './modules/exchange-confirmation/exchange-confirmation.module';
import { ExchangePostsModule } from './modules/exchange-posts/exchange-posts.module';
import { RefundRequestsModule } from './modules/refund-requests/refund-requests.module';
import { SpeedSmsModule } from './modules/speed-sms/speed-sms.module';
import { PushNotificationModule } from './modules/push-notification/push-notification.module';
import { AuctionConfigModule } from './modules/auction-config/auction-config.module';
import { AiIntegrationModule } from './modules/ai-integration/ai-integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        synchronize: configService.get('DB_SYNCHRONIZE') === 'TRUE',
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AnnouncementModule,
    EventsModule,
    AuctionModule,
    BidModule,
    AuthModule,
    UsersModule,
    ComicModule,
    GenreModule,
    FileUploadModule,
    PushNotificationModule,
    OrdersModule,
    OrderItemsModule,
    VnpayModule,
    ZalopayModule,
    VietNamAddressModule,
    TransactionsModule,
    AuctionConfigModule,
    ExchangesModule,
    UserAddressesModule,
    OtpModule,
    SellerDetailsModule,
    WalletDepositModule,
    WithdrawalModule,
    SourcesOfFundModule,
    SellerFeedbackModule,
    SellerSubscriptionsModule,
    SellerSubsPlansModule,
    PlansModule,
    DepositsModule,
    ChatRoomsModule,
    ChatMessagesModule,
    DeliveriesModule,
    DeliveryInformationModule,
    ExchangeComicsModule,
    ExchangeConfirmationModule,
    ExchangePostsModule,
    RefundRequestsModule,
    SpeedSmsModule,
    AiIntegrationModule,
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
