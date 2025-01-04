import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Comic } from './comics.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
