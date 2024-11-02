import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { Order } from './orders.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  @ManyToOne(() => User, (user) => user.addresses, { eager: true })
  user: User;

  @Column({
    name: 'full_name',
    type: 'varchar',
    nullable: false,
  })
  fullName: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  province: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  district: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  ward: string;

  @Column({
    name: 'detailed_address',
    type: 'varchar',
    nullable: false,
  })
  detailedAddress: string;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
  })
  usedTime: number;
}
