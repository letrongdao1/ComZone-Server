import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { UsersModule } from '../users/users.module';
import { ExchangeRequestsModule } from '../exchange-requests/exchange-requests.module';
import { ComicModule } from '../comics/comics.module';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ExchangeOffersModule } from '../exchange-offers/exchange-offers.module';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, ChatMessage]),
    UsersModule,
    ComicModule,
    ExchangesModule,
  ],
  controllers: [ChatRoomsController],
  providers: [ChatRoomsService],
  exports: [ChatRoomsService],
})
export class ChatRoomsModule {}
