import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('follow')
export class Follow extends BaseEntity {
  @ManyToOne(() => User, (user) => user.followed, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.following, { eager: true })
  follower: User;
}
