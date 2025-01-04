import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AuctionCriteria } from './auction-criteria.entity';

@Entity('editions')
export class Edition extends BaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(() => AuctionCriteria, (criteria) => criteria.disallowedEdition)
  disallowedCriteria: AuctionCriteria;
}
