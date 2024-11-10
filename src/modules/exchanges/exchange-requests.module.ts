import { Module } from '@nestjs/common';
import { ExchangeRequestsService } from './exchange-requests.service';
import { ExchangeRequestsController } from './exchange-requests.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeRequest } from 'src/entities/exchange-request.entity';
import { UsersModule } from '../users/users.module';
import { ComicModule } from '../comics/comics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeRequest]),
    UsersModule,
    ComicModule,
  ],
  controllers: [ExchangeRequestsController],
  providers: [ExchangeRequestsService],
  exports: [ExchangeRequestsService],
})
export class ExchangeRequestsModule {}
