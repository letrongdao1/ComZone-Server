import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Permission } from './permissions.entity';
import { User } from './users.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('roles')
export class Role extends BaseEntity {
  @Column()
  role_name: string;

  @ManyToMany(() => Role, (role) => role.role_name)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
