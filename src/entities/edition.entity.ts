import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity } from 'typeorm';

@Entity('editions')
export class Edition extends BaseEntity {
  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ default: false })
  auctionDisabled: boolean;
}
