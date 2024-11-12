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
import { ExchangeRequest } from './exchange-request.entity';
import { ComicsReport } from './comics-report.entity';
import { ChatRoom } from './chat-room.entity';
import { ComicsStatusEnum } from 'src/modules/comics/dto/comic-status.enum';
import { ExchangeOffer } from './exchange-offer.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('comics')
export class Comic extends BaseEntity {
  @ManyToOne(() => User, (user) => user.comics, { eager: true })
  sellerId: User;

  @ManyToMany(() => Genre, (genre) => genre.comics, { eager: true })
  @JoinTable({
    name: 'comic_genre',
    joinColumn: { name: 'comic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @Column()
  title: string;

  @Column({ nullable: true })
  author: string;

  @Column('text')
  description: string;

  @Column()
  coverImage: string;

  @Column({
    type: 'enum',
    enum: ['REGULAR', 'SPECIAL', 'LIMITED'],
    nullable: true,
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

  @Column({
    name: 'on_sale_since',
    type: 'datetime',
    nullable: true,
  })
  onSaleSince: Date;

  @Column('float')
  price: number;

  @Column({
    type: 'enum',
    enum: ComicsStatusEnum,
    default: ComicsStatusEnum.UNAVAILABLE,
  })
  status: string;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column({ type: 'simple-json', nullable: true })
  previewChapter: string[];

  @ManyToMany(() => ExchangeRequest, (request) => request.requestComics, {
    cascade: true,
  })
  exchangeRequests: ExchangeRequest[];

  @ManyToMany(() => ExchangeOffer, (offer) => offer.offerComics, {
    cascade: true,
  })
  exchangeOffers: ExchangeOffer[];

  @OneToMany(() => Auction, (auction) => auction.comics)
  auction: Auction[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.comics, {
    cascade: true,
  })
  order_item: OrderItem[];

  @OneToMany(() => ComicsReport, (comicsReport) => comicsReport.comics)
  comicsReports: ComicsReport[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.comics)
  chatRooms: ChatRoom[];

  @ManyToMany(() => ChatMessage, (message) => message.comics, {
    cascade: true,
  })
  messages: ChatMessage[];
}
