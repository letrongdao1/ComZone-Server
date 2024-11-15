import { BaseEntity } from 'src/common/entity.base';
import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Exchange } from './exchange.entity';
import { User } from './users.entity';
import { Comic } from './comics.entity';

@Entity('exchange-comics-lists')
export class ExchangeComicsList extends BaseEntity {
  @ManyToOne(() => Exchange, (exchange) => exchange.comicsList, { eager: true })
  exchange: Exchange;

  @ManyToOne(() => User, (user) => user.exchangeComicsList, { eager: true })
  user: User;

  @ManyToMany(() => Comic, (comics) => comics.exchange, { eager: true })
  @JoinTable({
    name: 'exchange-comics-list-item',
    joinColumn: { name: 'list_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'comics_id', referencedColumnName: 'id' },
  })
  comicsList: Comic[];
}
