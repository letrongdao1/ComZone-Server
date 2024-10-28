import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from './users.entity';

@Entity('source-of-fund')
export class SourceOfFund extends BaseEntity {
  @ManyToMany(() => User, (user) => user.sourcesOfFund)
  user: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;
}
