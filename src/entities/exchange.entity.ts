import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';
import { ExchangeCompensation } from './exchange-compensation.entity';
import { Deposit } from './deposit.entity';
import { ChatRoom } from './chat-room.entity';
import { Notification } from './notification.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('exchange')
export class Exchange extends BaseEntity {
  @ManyToOne(() => User, (user) => user.exchangeRequests, { nullable: false })
  requestUser: User;

  @ManyToOne(() => User, (user) => user.exchangeOffers, { nullable: true })
  offerUser: User;

  @ManyToOne(() => Comic, (comics) => comics.requestExchanges)
  requestComics: Comic;

  @ManyToOne(() => Comic, (comics) => comics.offerExchanges)
  offerComics: Comic;

  @Column({
    type: 'enum',
    enum: ['REQUESTING', 'DEALING', 'SUCCESSFUL', 'FAILED'],
    default: 'REQUESTING',
  })
  status: string;

  @OneToMany(
    () => ExchangeCompensation,
    (exchangeCompensation) => exchangeCompensation.exchange,
  )
  exchangeCompensations: ExchangeCompensation[];

  @OneToMany(() => Deposit, (deposit) => deposit.exchange)
  deposits: Deposit[];

  @OneToOne(() => ChatRoom, (chatRoom) => chatRoom.exchange)
  chatRoom: ChatRoom;

  @OneToMany(() => Notification, (notification) => notification.exchange)
  notifications: Notification[];
}
