import { Module } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { ChatMessagesController } from './chat-messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ChatRoomsModule } from '../chat-rooms/chat-rooms.module';
import { ChatMessagesGateway } from './chat-messages.gateway';
import { AuthModule } from '../authentication/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage]),
    ChatRoomsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService, ChatMessagesGateway],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
