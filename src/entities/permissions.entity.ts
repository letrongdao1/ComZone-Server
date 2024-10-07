import { Column, Entity, ManyToMany } from 'typeorm';
import { Role } from './roles.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  permission_description: string;

  @ManyToMany(() => Role, (role) => role.permissions, { cascade: true })
  roles: Role[];
}
