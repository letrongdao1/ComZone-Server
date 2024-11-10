import { BaseEntity } from 'src/common/entity.base';
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
import { ExchangeRequest } from './exchange-request.entity';
import { User } from './users.entity';
import { Transaction } from './transactions.entity';
import { Announcement } from './announcement.entity';
import { Comic } from './comics.entity';

@Entity('exchange-offer')
export class ExchangeOffer extends BaseEntity {
  @ManyToOne(() => ExchangeRequest, (request) => request.exchangeOffers)
  @JoinColumn({ name: 'exchange_request' })
  exchangeRequest: ExchangeRequest;

  @ManyToOne(() => User, (user) => user.exchangeOffers)
  @JoinColumn({ name: 'user' })
  user: User;

  @ManyToMany(() => Comic, (comics) => comics.exchangeOffers, {
    nullable: false,
    eager: true,
  })
  @JoinTable({
    name: 'exchange_offer_comics',
    joinColumn: { name: 'exchange_offer_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comics_id', referencedColumnName: 'id' },
  })
  offerComics: Comic[];

  @Column({
    name: 'compensation_amount',
    type: 'float',
    precision: 2,
    nullable: true,
  })
  compensationAmount: number;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
  })
  status: string;

  @OneToOne(() => Transaction, (transaction) => transaction.exchangeOffer)
  transactions: Transaction[];

  @OneToMany(() => Announcement, (announcement) => announcement.exchangeOffer)
  announcements: Announcement[];
}
