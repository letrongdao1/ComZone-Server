import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { Exchange } from './exchange.entity';

@Entity('chat-room')
export class ChatRoom extends BaseEntity {
  @ManyToOne(() => User, (user) => user.firstChatRooms)
  firstUser: User;

  @ManyToOne(() => User, (user) => user.secondChatRooms)
  secondUser: User;

  @Column({
    name: 'last_message',
    type: 'text',
    nullable: true,
  })
  lastMessage: string;

  @ManyToOne(() => Comic, (comics) => comics.chatRooms)
  comics: Comic;

  @ManyToOne(() => Exchange, (exchange) => exchange.chatRooms)
  exchange: Exchange;
}
