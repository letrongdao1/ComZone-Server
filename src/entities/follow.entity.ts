import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { NonPrimaryBaseEntity } from 'src/common/non-primary-entity.base';

@Entity('follow')
export class Follow extends NonPrimaryBaseEntity {
  @ManyToOne(() => User, (user) => user.followed, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.following, { eager: true })
  follower: User;
}
