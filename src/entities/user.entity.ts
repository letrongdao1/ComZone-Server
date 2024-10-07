import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    name: 'name',
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    nullable: true,
  })
  phone: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: ['MEMBER', 'SELLER', 'MODERATOR', 'ADMIN'],
    default: 'MEMBER',
  })
  role: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['AVAILABLE', 'BANNED'],
    default: 'AVAILABLE',
  })
  status: string;

  @Column({
    name: 'is_verified',
    type: 'boolean',
    default: false,
  })
  is_verified: boolean;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    nullable: true,
  })
  refresh_token: string;
}
