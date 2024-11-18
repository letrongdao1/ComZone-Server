import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { UsersModule } from '../users/users.module';
import { ComicModule } from '../comics/comics.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange]), UsersModule, ComicModule],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
