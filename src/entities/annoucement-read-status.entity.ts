import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Announcement } from './announcement.entity';
import { BaseEntity } from 'src/common/entity.base';

@Entity('announcement_read_status')
export class AnnouncementReadStatus extends BaseEntity {
  @ManyToOne(() => User, (user) => user.announcementReadStatuses)
  user: User;

  @ManyToOne(() => Announcement, (announcement) => announcement.readStatuses)
  announcement: Announcement;

  @Column({
    name: 'is_read',
    type: 'boolean',
    default: false,
  })
  isRead: boolean;
}
