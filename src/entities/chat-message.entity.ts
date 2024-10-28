import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from './users.entity';

@Entity('chat-message')
export class ChatMessage extends BaseEntity {
  @ManyToOne(() => ChatRoom)
  chatRoom: ChatRoom;

  @ManyToOne(() => User)
  user: User;

  @Column({
    type: 'uuid',
    name: 'replied_to_message',
    nullable: true,
  })
  repliedToMessage: any;

  @Column({
    type: 'enum',
    enum: ['TEXT', 'IMAGE', 'LINK', 'REPLY'],
    default: 'TEXT',
  })
  type: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;
}
