import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { Role } from './roles.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({
    nullable: false,
    unique: true,
  })
  permission_description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: 'permission_role',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
