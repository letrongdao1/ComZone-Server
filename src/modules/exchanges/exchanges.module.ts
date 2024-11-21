import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { UsersModule } from '../users/users.module';
import { ComicModule } from '../comics/comics.module';
import { ExchangePostsModule } from '../exchange-posts/exchange-posts.module';
import { ExchangeComics } from 'src/entities/exchange-comics.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { Delivery } from 'src/entities/delivery.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exchange, ExchangeComics, Delivery]),
    UsersModule,
    ComicModule,
    ExchangePostsModule,
    TransactionsModule,
  ],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
