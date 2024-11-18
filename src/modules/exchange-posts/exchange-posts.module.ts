import { Module } from '@nestjs/common';
import { ExchangePostsService } from './exchange-posts.service';
import { ExchangePostsController } from './exchange-posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExchangePost } from 'src/entities/exchange-post.entity';
import { UsersModule } from '../users/users.module';
import { Exchange } from 'src/entities/exchange.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExchangePost, Exchange]), UsersModule],
  controllers: [ExchangePostsController],
  providers: [ExchangePostsService],
  exports: [ExchangePostsService],
})
export class ExchangePostsModule {}
