import { BaseEntity } from 'src/common/entity.base';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './users.entity';
import { Genre } from './genres.entity';
import { OrderItem } from './order-item.entity';
import { Auction } from './auction.entity';
import { Exchange } from './exchange.entity';
import { ComicsReport } from './comics-report.entity';
import { ChatRoom } from './chat-room.entity';

@Entity('comics')
export class Comic extends BaseEntity {
  @ManyToOne(() => User, (user) => user.comics, { eager: true })
  sellerId: User;

  @ManyToMany(() => Genre, (genre) => genre.comics)
  @JoinTable({
    name: 'comic_genre',
    joinColumn: { name: 'comic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @Column()
  title: string;

  @Column()
  author: string;

  @Column('text')
  description: string;

  @Column('simple-array')
  coverImage: string[];

  @Column({
    type: 'enum',
    enum: ['REGULAR', 'SPECIAL', 'LIMITED'],
    default: 'REGULAR',
  })
  edition: string;

  @Column({
    type: 'enum',
    enum: ['USED', 'SEALED'],
    default: 'USED',
  })
  condition: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  page: number;

  @Column('datetime')
  publishedDate: Date;

  @Column('float')
  price: number;

  @Column({
    type: 'enum',
    enum: [
      'UNAVAILABLE',
      'AVAILABLE',
      'AUCTION',
      'EXCHANGE',
      'SOLD',
      'REMOVED',
    ],
    default: 'UNAVAILABLE',
  })
  status: string;

  @Column()
  quantity: number;

  @Column('simple-json')
  previewChapter: string[];

  @OneToMany(() => Auction, (auction) => auction.comics)
  auction: Auction[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.comics, {
    cascade: true,
  })
  order_item: OrderItem[];

  @OneToMany(() => Exchange, (exchange) => exchange.requestComics)
  requestExchanges: Exchange[];

  @OneToMany(() => Exchange, (exchange) => exchange.offerComics)
  offerExchanges: Exchange[];

  @OneToMany(() => ComicsReport, (comicsReport) => comicsReport.comics)
  comicsReports: ComicsReport[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.comics)
  chatRooms: ChatRoom[];
}
