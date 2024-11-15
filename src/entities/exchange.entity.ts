import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Delivery } from './delivery.entity';
import { ExchangeStatusEnum } from 'src/modules/exchanges/dto/exchange-status-enum';
import { ExchangeComicsList } from './exchange-comics-list.entity';
import { ExchangeConfirmation } from './exchange-confirmation.entity';

@Entity('exchanges')
export class Exchange extends BaseEntity {
  @ManyToOne(() => User, (user) => user.exchangeRequests)
  requestUser: User;

  @ManyToOne(() => User, (user) => user.exchangeOffers)
  postUser: User;

  @Column({
    name: 'post_content',
    type: 'text',
  })
  postContent: string;

  @Column({
    name: 'images',
    type: 'simple-json',
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

  @OneToMany(() => ExchangeComicsList, (list) => list.exchange)
  comicsList: ExchangeComicsList[];

  @OneToMany(
    () => ExchangeConfirmation,
    (confirmation) => confirmation.exchange,
  )
  confirmations: ExchangeConfirmation[];
}
