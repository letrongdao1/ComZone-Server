import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('addresses')
export class Address extends BaseEntity {
  @ManyToOne(() => User, (user) => user.addresses, { eager: true })
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  fullName: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  province: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  district: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  ward: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  detailedAddress: string;

  @Column({
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
