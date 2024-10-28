import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('user-report')
export class UserReport extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userReports, { eager: true })
  user: User;

  @ManyToOne(() => User, (user) => user.reportedUserReports, { eager: true })
  reportedUser: User;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  criteria: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  reason: string;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;
}
