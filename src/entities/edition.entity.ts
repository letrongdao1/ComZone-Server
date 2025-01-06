import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';

@Entity('editions')
export class Edition extends BaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: true, default: false })
  isSpecial: boolean;

  @Column({ default: false })
  auctionDisabled: boolean;

  @OneToMany(() => Comic, (comic) => comic.edition)
  comics: Comic[];
}
