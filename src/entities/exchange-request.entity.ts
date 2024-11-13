import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { ExchangeOffer } from './exchange-offer.entity';
import { Deposit } from './deposit.entity';
import { ChatRoom } from './chat-room.entity';
import { Announcement } from './announcement.entity';
import { BaseEntity } from 'src/common/entity.base';
import { ExchangeRequestStatusEnum } from '../modules/exchange-requests/dto/exchange-request-status.enum';
import { Delivery } from './delivery.entity';

@Entity('exchange-request')
export class ExchangeRequest extends BaseEntity {
  @ManyToOne(() => User, (user) => user.exchangeRequests, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToMany(() => Comic, (comics) => comics.exchangeRequests, {
    nullable: false,
    eager: true,
  })
  @JoinTable({
    name: 'exchange_request_comics',
    joinColumn: { name: 'exchange_request_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comics_id', referencedColumnName: 'id' },
  })
  requestComics: Comic[];

  @Column({
    name: 'post_content',
    type: 'text',
  })
  postContent: string;

  @Column({
    name: 'deposit_amount',
    type: 'float',
    nullable: true,
  })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: ExchangeRequestStatusEnum,
    default: ExchangeRequestStatusEnum.AVAILABLE,
  })
  status: string;

  @OneToMany(() => ExchangeOffer, (offer) => offer.exchangeRequest)
  exchangeOffers: ExchangeOffer[];

  @OneToMany(() => Deposit, (deposit) => deposit.exchangeRequest)
  deposits: Deposit[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.exchangeRequest)
  chatRooms: ChatRoom[];

  @OneToMany(() => Announcement, (announcement) => announcement.exchangeRequest)
  announcements: Announcement[];

  @OneToOne(() => Delivery, (delivery) => delivery.exchangeRequest)
  delivery: Delivery;
}
