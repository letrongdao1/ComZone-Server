import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Edition } from './edition.entity';

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

  @Column({ name: 'condition_level', type: 'int', nullable: false })
  conditionLevel: number;

  @OneToMany(() => Edition, (edition) => edition.disallowedCriteria)
  disallowedEdition: Edition[];
}
