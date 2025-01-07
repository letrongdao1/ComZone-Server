import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Condition } from './condition.entity';

@Entity('auction-criteria')
export class AuctionCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn({
    type: 'datetime',
  })
  updatedAt: Date;

  @Column({ name: 'is_full_info_filled', type: 'boolean', nullable: false })
  isFullInfoFilled: boolean;

  @ManyToOne(() => Condition, (condition) => condition.criteria)
  conditionLevel: Condition;

  @Column({ name: 'edition_restricted', type: 'boolean', nullable: false })
  editionRestricted: boolean;
}
