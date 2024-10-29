import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('seller_details')
export class SellerDetails extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  verifiedPhone: string;

  @Column({
    name: 'sold_count',
    type: 'bigint',
    nullable: false,
    default: 0,
  })
  soldCount: number;

  @Column({
    name: 'follower_count',
    type: 'bigint',
    nullable: false,
    default: 0,
  })
  followerCount: number;

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
}
