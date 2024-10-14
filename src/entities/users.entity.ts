import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';
import { Role } from './roles.entity';
import { Cart } from './carts.entity';
import { Order } from './orders.entity';

@Entity('users')
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

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

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

  @OneToMany(() => Comic, (comic) => comic.sellerId)
  comics: Comic[];
  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.seller)
  sold_order: Order[];

  @OneToMany(() => Order, (order) => order.buyer)
  purchased_order: Order[];
}
