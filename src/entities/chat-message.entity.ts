import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from './users.entity';

@Entity('chat-message')
export class ChatMessage extends BaseEntity {
  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMessages, {
    eager: true,
  })
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.chatMessages, { eager: true })
  user: User;

  @Column({
    type: 'uuid',
    name: 'replied_to_message',
    nullable: true,
  })
  repliedToMessage: any;

  @Column({
    type: 'enum',
    enum: ['TEXT', 'IMAGE', 'LINK', 'REPLY', 'SYSTEM'],
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

  @OneToOne(() => ChatRoom, (chatRoom) => chatRoom.lastMessage)
  lastMessageChatRoom: ChatRoom;
}
