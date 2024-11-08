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
import { ExchangeCompensation } from './exchange-compensation.entity';
import { Deposit } from './deposit.entity';
import { ChatRoom } from './chat-room.entity';
import { Notification } from './notification.entity';
import { BaseEntity } from 'src/common/entity.base';
import { ExchangeStatusEnum } from 'src/modules/exchanges/dto/exchange-status.enum';

@Entity('exchange')
export class Exchange extends BaseEntity {
  @ManyToOne(() => User, (user) => user.exchangeRequests, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'request_user' })
  requestUser: User;

  @ManyToMany(() => Comic, (comics) => comics.requestExchanges, {
    nullable: false,
    eager: true,
  })
  @JoinTable({
    name: 'requested_exchange_comics',
    joinColumn: { name: 'exchange_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comics_id', referencedColumnName: 'id' },
  })
  requestComics: Comic[];

  @ManyToMany(() => Comic, (comics) => comics.offerExchange, {
    nullable: true,
    eager: true,
  })
  @JoinTable({
    name: 'offered_exchange_comics',
    joinColumn: { name: 'exchange_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comics_id', referencedColumnName: 'id' },
  })
  offerComics: Comic[];

  @ManyToOne(() => User, (user) => user.exchangeOffers, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'offer_user' })
  offerUser: User;

  @Column({
    name: 'post_content',
    type: 'text',
  })
  postContent: string;

  @Column({
    type: 'enum',
    enum: ExchangeStatusEnum,
    default: ExchangeStatusEnum.AVAILABLE,
  })
  status: string;

  @OneToMany(
    () => ExchangeCompensation,
    (exchangeCompensation) => exchangeCompensation.exchange,
  )
  exchangeCompensations: ExchangeCompensation[];

  @OneToMany(() => Deposit, (deposit) => deposit.exchange)
  deposits: Deposit[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.exchange)
  chatRooms: ChatRoom[];

  @OneToMany(() => Notification, (notification) => notification.exchange)
  notifications: Notification[];
}
