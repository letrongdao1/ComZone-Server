import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entity.base';
import { User } from './users.entity';
import { Delivery } from './delivery.entity';

@Entity('delivery-information')
export class DeliveryInformation extends BaseEntity {
  @ManyToOne(() => User, (user) => user.deliveryInformation, { eager: true })
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

  @OneToMany(() => Delivery, (delivery) => delivery.from)
  fromDeliveries: Delivery[];

  @OneToMany(() => Delivery, (delivery) => delivery.to)
  toDeliveries: Delivery[];
}
