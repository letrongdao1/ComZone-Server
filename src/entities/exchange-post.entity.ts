import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Exchange } from './exchange.entity';
import { ExchangePostStatusEnum } from 'src/modules/exchange-posts/dto/post.enum';

@Entity('exchange-posts')
export class ExchangePost extends BaseEntity {
  @ManyToOne(() => User, (user) => user.posts, { eager: true })
  user: User;

  @Column({
    name: 'post_content',
    type: 'text',
  })
  postContent: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  images: string[];

  @Column({
    type: 'enum',
    enum: ExchangePostStatusEnum,
    default: ExchangePostStatusEnum.AVAILABLE,
  })
  status: string;

  @OneToMany(() => Exchange, (exchange) => exchange)
  exchanges: Exchange[];
}