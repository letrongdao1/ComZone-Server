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
  @ManyToOne(() => User, (user) => user.comics)
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

  @Column('datetime')
  publishedDate: Date;

  @Column('decimal')
  price: number;

  @Column({
    type: 'enum',
    enum: ['UNAVAILABLE', 'AVAILABLE', 'SOLD', 'DELETED'],
    default: 'AVAILABLE',
  })
  status: string;

  @Column()
  quantity: number;

  @Column('simple-array')
  previewChapter: string[];

  @Column()
  isAuction: boolean; // Change to boolean for simplicity

  @Column()
  isExchange: boolean;

  @Column('float')
  comicCommission: number;

  @OneToMany(() => Auction, (auction) => auction.comics)
  auction: Auction[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.comics)
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
