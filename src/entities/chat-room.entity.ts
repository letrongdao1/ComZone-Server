import { BaseEntity } from 'src/common/entity.base';
import { Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { ChatMessage } from './chat-message.entity';
import { Exchange } from './exchange.entity';

@Entity('chat-room')
export class ChatRoom extends BaseEntity {
  @ManyToOne(() => User, (user) => user.firstChatRooms, { eager: true })
  firstUser: User;

  @ManyToOne(() => User, (user) => user.secondChatRooms, { eager: true })
  secondUser: User;

  @ManyToOne(() => Comic, (comics) => comics.chatRooms)
  comics: Comic;

  @ManyToOne(() => Exchange, (exchange) => exchange.chatRooms)
  exchange: Exchange;

  @OneToOne(() => ChatMessage, (message) => message.lastMessageChatRoom, {
    nullable: true,
  })
  @JoinColumn({ name: 'last_message' })
  lastMessage: ChatMessage;

  @OneToMany(() => ChatMessage, (mess) => mess.chatRoom)
  chatMessages: ChatMessage[];
}
