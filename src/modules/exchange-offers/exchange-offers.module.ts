import { Module } from '@nestjs/common';
import { ExchangeOffersService } from './exchange-offers.service';
import { ExchangeOffersController } from './exchange-offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangeOffer } from 'src/entities/exchange-offer.entity';
import { ExchangeRequestsModule } from '../exchanges/exchange-requests.module';
import { UsersModule } from '../users/users.module';
import { ComicModule } from '../comics/comics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExchangeOffer]),
    ExchangeRequestsModule,
    UsersModule,
    ComicModule,
  ],
  controllers: [ExchangeOffersController],
  providers: [ExchangeOffersService],
})
export class ExchangeOffersModule {}
