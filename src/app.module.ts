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
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { ZalopayModule } from './modules/zalopay/zalopay.module';
import { VnpayModule } from './modules/vnpay/vnpay.module';
import { VietNamAddressModule } from './modules/viet-nam-address/viet-nam-address.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { UserAddressesModule } from './modules/user-addresses/user-addresses.module';
import { OtpModule } from './modules/otps/otps.module';
import { SellerDetailsModule } from './modules/seller-details/seller-details.module';

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

    AuthModule,
    UsersModule,
    ComicModule,
    GenreModule,
    FileUploadModule,
    NotificationsModule,
    CartModule,
    OrdersModule,
    OrderItemsModule,
    VnpayModule,
    ZalopayModule,
    VietNamAddressModule,
    WalletsModule,
    TransactionsModule,
    UserAddressesModule,
    OtpModule,
    SellerDetailsModule,
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
