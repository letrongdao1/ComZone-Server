import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Permission } from './permissions.entity';
import { User } from './users.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
  })
  role_name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
