import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ name: 'edition_restricted', type: 'boolean', nullable: false })
  editionRestricted: boolean;
}
