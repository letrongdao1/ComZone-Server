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
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PermissionsGuard } from './modules/authorization/permission.guard';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';

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
    RolesModule,
    PermissionsModule,
    ComicModule,
    GenreModule,
    FileUploadModule,
    NotificationsModule,
    OrdersModule,
    OrderItemsModule,
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
