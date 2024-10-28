import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('seller_information')
export class SellerInformation extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  verifiedPhone: string;

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
    type: 'enum',
    enum: ['PENDING', 'APPROVED'],
  })
  registerStatus: string;
}
