import { BaseEntity } from 'src/common/entity.base';
import { Entity, ManyToOne } from 'typeorm';
import { Exchange } from './exchange.entity';
import { User } from './users.entity';
import { Comic } from './comics.entity';

@Entity('exchange-comics')
export class ExchangeComics extends BaseEntity {
  @ManyToOne(() => Exchange, (exchange) => exchange.exchangeComics)
  exchange: Exchange;

  @ManyToOne(() => User, (user) => user.exchangeComics)
  user: User;

  @ManyToOne(() => Comic, (comics) => comics.exchangeComics, { eager: true })
  comics: Comic;
}
