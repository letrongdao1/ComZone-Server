import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comic } from './comics.entity';
import { AuctionCriteria } from './auction-criteria.entity';

@Entity('conditions')
export class Condition {
  @PrimaryColumn({ type: 'int' })
  value: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  usageLevel?: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'boolean' })
  isRemarkable: boolean;

  @CreateDateColumn({
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
  })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @OneToMany(() => Comic, (comic) => comic.condition)
  comics: Comic[];

  @OneToMany(() => AuctionCriteria, (criteria) => criteria)
  criteria: AuctionCriteria[];
}
