import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Comic } from './comics.entity';

@Entity('user-report')
export class ComicsReport extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userReports, { eager: true })
  user: User;

  @ManyToOne(() => Comic, (comics) => comics.comicsReports, { eager: true })
  comics: Comic;

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
