import { BaseEntity } from 'src/common/entity.base';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './users.entity';
import { Genre } from './genres.entity';
import { OrderItem } from './order-item.entity';
import { ComicsReport } from './comics-report.entity';
import { ChatRoom } from './chat-room.entity';
import { ComicsStatusEnum } from 'src/modules/comics/dto/comic-status.enum';
import { ChatMessage } from './chat-message.entity';
import { ComicsTypeEnum } from 'src/modules/comics/dto/comic-type.enum';
import { ExchangeComics } from './exchange-comics.entity';
import { Merchandise } from './merchandise.entity';
import { Edition } from './edition.entity';
import { AuctionRequest } from './auction-request.entity';
import { Auction } from './auction.entity';

@Entity('comics')
export class Comic extends BaseEntity {
  @ManyToOne(() => User, (user) => user.comics, { eager: true })
  sellerId: User;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({
    default: 1,
  })
  quantity: number;

  @Column({
    name: 'episodes-list',
    type: 'simple-json',
    nullable: true,
  })
  episodesList?: string[];

  @ManyToMany(() => Genre, (genre) => genre.comics, { eager: true })
  @JoinTable({
    name: 'comic_genre',
    joinColumn: { name: 'comic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres?: Genre[];

  @Column('text')
  description: string;

  @Column({ type: 'varchar' })
  cover: 'SOFT' | 'HARD' | 'DETACHED';

  @Column({ type: 'varchar' })
  color: 'GRAYSCALE' | 'COLORED';

  @Column({
    type: 'int',
    nullable: true,
  })
  page?: number;

  @Column({ type: 'float', nullable: true })
  length?: number;

  @Column({ type: 'float', nullable: true })
  width?: number;

  @Column({ type: 'float', nullable: true })
  thickness?: number;

  @ManyToMany(() => Merchandise, (merch) => merch.comics, { eager: true })
  @JoinTable({
    name: 'comic_merchandise',
    joinColumn: { name: 'comic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'merchandise_id', referencedColumnName: 'id' },
  })
  merchandises: Merchandise[];

  @Column({ type: 'varchar', nullable: true })
  publisher?: string;

  @Column({ name: 'publication_year', type: 'int', nullable: true })
  publicationYear?: number;

  @Column({ name: 'origin_country', nullable: true })
  originCountry?: string;

  @Column({ name: 'release_year', type: 'int', nullable: true })
  releaseYear?: number;

  @Column({
    type: 'int',
  })
  condition: number;

  @ManyToOne(() => Edition, (edition) => edition.comics, { eager: true })
  @JoinColumn()
  edition: Edition;

  @Column({ name: 'will_not_auction', type: 'boolean', default: false })
  willNotAuction: boolean;

  @Column()
  coverImage: string;

  @Column({ type: 'simple-json', nullable: true })
  previewChapter: string[];

  @Column('float', { nullable: true })
  price?: number;

  @Column({
    name: 'on_sale_since',
    type: 'datetime',
    nullable: true,
  })
  onSaleSince?: Date;

  @Column({
    type: 'enum',
    enum: ComicsTypeEnum,
    default: ComicsTypeEnum.NONE,
  })
  type: ComicsTypeEnum;

  @Column({
    type: 'enum',
    enum: ComicsStatusEnum,
    default: ComicsStatusEnum.UNAVAILABLE,
  })
  status: ComicsStatusEnum;

  @ManyToMany(() => ExchangeComics, (exchangeComics) => exchangeComics.comics, {
    cascade: true,
  })
  exchangeComics: ExchangeComics[];

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

  @OneToMany(() => AuctionRequest, (request) => request.comic)
  auctionRequests: AuctionRequest[];
  @OneToMany(() => Auction, (auction) => auction.comics)
  auction: Auction[];
}
