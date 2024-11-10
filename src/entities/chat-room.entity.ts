import { BaseEntity } from 'src/common/entity.base';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { ExchangeRequest } from './exchange-request.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('chat-room')
export class ChatRoom extends BaseEntity {
  @ManyToOne(() => User, (user) => user.firstChatRooms)
  firstUser: User;

  @ManyToOne(() => User, (user) => user.secondChatRooms)
  secondUser: User;

  @OneToOne(() => ChatMessage, (message) => message.lastMessageChatRoom, {
    nullable: true,
  })
  @JoinColumn({ name: 'last_message' })
  lastMessage: ChatMessage;

  @ManyToOne(() => Comic, (comics) => comics.chatRooms)
  comics: Comic;

  @ManyToOne(() => ExchangeRequest, (request) => request.chatRooms)
  exchangeRequest: ExchangeRequest;

  @ManyToOne(() => ChatMessage, (message) => message.chatRoom)
  chatMessages: ChatMessage[];
}
