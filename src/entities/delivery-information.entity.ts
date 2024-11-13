import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { Delivery } from './delivery.entity';

@Entity('delivery')
export class DeliveryInformation extends BaseEntity {
  @ManyToOne(() => User, (user) => user.deliveryInformation)
  user: User;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
  })
  phone: string;

  @Column({
    name: 'province_id',
    type: 'int',
  })
  provinceId: number;

  @Column({
    name: 'district_id',
    type: 'int',
  })
  districtId: number;

  @Column({
    name: 'ward_id',
    type: 'varchar',
  })
  wardId: string;

  @Column({
    type: 'varchar',
  })
  address: string;

  @OneToOne(() => Delivery, (delivery) => delivery.from)
  from: Delivery;

  @OneToOne(() => Delivery, (delivery) => delivery.to)
  to: Delivery;
}
