import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Exchange } from './exchange.entity';
import { User } from './users.entity';

@Entity('exchange-confirmation')
export class ExchangeConfirmation extends BaseEntity {
  @ManyToOne(() => Exchange, (exc) => exc.confirmations)
  exchange: Exchange;

  @ManyToOne(() => User, (exc) => exc.exchangeConfirmations)
  user: User;

  @Column({
    name: 'packaging_images',
    type: 'simple-json',
    nullable: true,
  })
  packagingImages: string[];

  @Column({
    name: 'dealing_confirm',
    type: 'boolean',
    nullable: true,
  })
  dealingConfirm: boolean;

  @Column({
    name: 'delivery_confirm',
    type: 'boolean',
    nullable: true,
  })
  deliveryConfirm: boolean;
}
