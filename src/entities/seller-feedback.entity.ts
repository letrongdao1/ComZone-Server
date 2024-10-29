import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity('seller-feedback')
export class SellerFeedback extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userSellerFeedbacks)
  user: User;

  @ManyToOne(() => User, (user) => user.sellerFeedbacks)
  seller: User;

  @Column({
    type: 'tinyint',
    nullable: false,
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: false,
  })
  comment: string;

  @Column({
    name: 'attached_images',
    type: 'simple-json',
    nullable: true,
  })
  attachedImages: string[];
}
