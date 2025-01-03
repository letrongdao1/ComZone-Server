import { Module } from '@nestjs/common';
import { ExchangeComicsService } from './exchange-comics.service';
import { ExchangeComicsController } from './exchange-comics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeComics } from 'src/entities/exchange-comics.entity';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { UsersModule } from '../users/users.module';
import { ComicModule } from '../comics/comics.module';
import { EventsModule } from '../socket/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeComics]),
    ExchangesModule,
    UsersModule,
    ComicModule,
    EventsModule,
  ],
  controllers: [ExchangeComicsController],
  providers: [ExchangeComicsService],
  exports: [ExchangeComicsService],
})
export class ExchangeComicsModule {}
