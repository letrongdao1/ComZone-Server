import { BaseEntity } from 'src/common/entity.base';
import { Entity, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { Exchange } from './exchange.entity';

@Entity('chat-room')
export class ChatRoom extends BaseEntity {
  @ManyToOne(() => User, (user) => user.firstChatRooms)
  firstUser: User;

  @ManyToOne(() => User, (user) => user.secondChatRooms)
  secondUser: User;

  @ManyToOne(() => Comic, (comics) => comics.chatRooms)
  comics: Comic;

  @OneToOne(() => Exchange, (exchange) => exchange.chatRoom)
  exchange: Exchange;

//   @OneToOne(() => )
}
