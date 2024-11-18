import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Delivery } from './delivery.entity';
import { ExchangeStatusEnum } from 'src/modules/exchanges/dto/exchange-status-enum';
import { ExchangeConfirmation } from './exchange-confirmation.entity';
import { ExchangeComics } from './exchange-comics.entity';
import { Transaction } from './transactions.entity';
import { Deposit } from './deposit.entity';
import { Announcement } from './announcement.entity';
import { ChatRoom } from './chat-room.entity';

@Entity('exchanges')
export class Exchange extends BaseEntity {
  @ManyToOne(() => User, (user) => user.exchangeRequests, { eager: true })
  requestUser: User;

  @ManyToOne(() => User, (user) => user.exchangeOffers, { eager: true })
  postUser: User;

  @Column({
    name: 'post_content',
    type: 'text',
  })
  postContent: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  images: string[];

  @Column({
    name: 'compensation_amount',
    type: 'float',
    nullable: true,
  })
  compensationAmount: number;

  @Column({
    name: 'deposit_amount',
    type: 'float',
    nullable: true,
  })
  depositAmount: number;

  @Column({
    type: 'enum',
    enum: ExchangeStatusEnum,
    default: ExchangeStatusEnum.PENDING,
  })
  status: string;

  @OneToMany(() => ExchangeComics, (comics) => comics.exchange)
  exchangeComics: ExchangeComics[];

  @OneToMany(
    () => ExchangeConfirmation,
    (confirmation) => confirmation.exchange,
  )
  confirmations: ExchangeConfirmation[];

  @OneToMany(() => Transaction, (transaction) => transaction.exchange)
  transactions: Transaction[];

  @OneToMany(() => Deposit, (deposit) => deposit.exchange)
  deposits: Deposit[];

  @OneToMany(() => Announcement, (ann) => ann.exchange)
  announcements: Announcement[];

  @OneToMany(() => ChatRoom, (room) => room.exchange)
  chatRooms: ChatRoom[];

  @ManyToMany(() => Delivery, (delivery) => delivery.exchanges)
  deliveries: Delivery[];
}
