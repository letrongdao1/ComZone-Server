import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Delivery } from './delivery.entity';
import { ExchangeStatusEnum } from 'src/modules/exchanges/dto/exchange-status-enum';
import { ExchangeConfirmation } from './exchange-confirmation.entity';
import { ExchangeComics } from './exchange-comics.entity';
import { Transaction } from './transactions.entity';
import { Deposit } from './deposit.entity';
import { Announcement } from './announcement.entity';
import { ChatRoom } from './chat-room.entity';
import { ExchangePost } from './exchange-post.entity';
import { RefundRequest } from './refund-request.entity';

@Entity('exchanges')
export class Exchange extends BaseEntity {
  @ManyToOne(() => ExchangePost, (post) => post.exchanges, { eager: true })
  post: ExchangePost;

  @ManyToOne(() => User, (user) => user.exchanges, { eager: true })
  requestUser: User;

  @Column({
    name: 'compensation_amount',
    type: 'float',
    nullable: true,
  })
  compensationAmount: number;

  @ManyToOne(() => User, (user) => user.compensateExchanges, {
    nullable: true,
    eager: true,
  })
  compensateUser: User;

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

  @OneToOne(() => ChatRoom, (room) => room.exchange)
  chatRoom: ChatRoom;

  @OneToMany(() => Delivery, (delivery) => delivery.exchange)
  deliveries: Delivery[];

  @OneToMany(() => RefundRequest, (request) => request.exchange)
  refundRequests: RefundRequest[];
}
