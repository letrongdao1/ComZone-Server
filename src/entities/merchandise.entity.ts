import { Entity, Column, ManyToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('merchandise')
export class Merchandise extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;

  @Column({
    name: 'sub_name',
    nullable: true,
  })
  subName: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({
    nullable: true,
  })
  caution: string;

  @ManyToMany(() => Comic, (comic) => comic.merchandises)
  comics: Comic[];
}
