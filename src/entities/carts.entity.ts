// cart.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Comic } from './comics.entity';
import { User } from './users.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.carts, { eager: true })
  user: User;

  @ManyToMany(() => Comic)
  @JoinTable()
  comics: Comic[];

  @Column('simple-json')
  quantities: { [comicId: string]: number };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalPrice: number;
}
