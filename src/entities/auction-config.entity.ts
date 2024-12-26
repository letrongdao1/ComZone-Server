import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity } from 'typeorm';

@Entity('auction-config')
export class AuctionConfig extends BaseEntity {
  @Column()
  maxPriceConfig: number;

  @Column()
  priceStepConfig: number;

  @Column()
  depositAmountConfig: number;
}
