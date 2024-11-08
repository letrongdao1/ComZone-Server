import { Module } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { ChatRoomsController } from './chat-rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { UsersModule } from '../users/users.module';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { ComicModule } from '../comics/comics.module';
import { ChatMessage } from 'src/entities/chat-message.entity';

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
