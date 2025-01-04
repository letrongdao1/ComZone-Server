import { Entity, Column, ManyToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('genres')
export class Genre extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @ManyToMany(() => Comic, (comic) => comic.genres)
  comics: Comic[];
}
