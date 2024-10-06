import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity, OneToMany } from 'typeorm';
import { Comic } from './comics.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({
    name: 'email',
    nullable: false,
  })
  email: string;

  @Column({
    name: 'password',
    nullable: false,
  })
  password: string;

  @Column()
  fullName: string;

  @OneToMany(() => Comic, (comic) => comic.sellerId)
  comics: Comic[];
}
