import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Comic } from './comics.entity';

@Entity('genres')
export class Genre {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Comic, (comic) => comic.genres)
  comics: Comic[];
}
