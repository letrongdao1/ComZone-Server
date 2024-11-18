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
import { ComicsReport } from './comics-report.entity';
import { ChatRoom } from './chat-room.entity';
import { ComicsStatusEnum } from 'src/modules/comics/dto/comic-status.enum';
import { ChatMessage } from './chat-message.entity';
import { ComicsTypeEnum } from 'src/modules/comics/dto/comic-type.enum';
import { ExchangeComics } from './exchange-comics.entity';

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

  @Column({ type: 'simple-json', nullable: true })
  previewChapter: string[];

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

  @Column('varchar', { nullable: true })
  publishedDate: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  page: number;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column({
    name: 'episodes-list',
    type: 'simple-json',
    nullable: true,
  })
  episodesList: string[];

  @Column({
    name: 'on_sale_since',
    type: 'datetime',
    nullable: true,
  })
  onSaleSince: Date;

  @Column('float', { nullable: true })
  price: number;

  @Column({
    type: 'enum',
    enum: ComicsTypeEnum,
    default: ComicsTypeEnum.SELL,
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ComicsStatusEnum,
    default: ComicsStatusEnum.UNAVAILABLE,
  })
  status: string;

  @ManyToMany(() => ExchangeComics, (exchangeComics) => exchangeComics.comics, {
    cascade: true,
  })
  exchangeComics: ExchangeComics[];

  @OneToMany(() => Auction, (auction) => auction.comics)
  auction: Auction[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.comics)
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
