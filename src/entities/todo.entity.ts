import { BaseEntity } from 'src/common/entity.base';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'todos' })
export class Todo extends BaseEntity {
  @Column()
  title: string;

  @Column({
    name: 'status',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  status: boolean;

  @Column({
    name: 'note',
    type: 'varchar',
    nullable: true,
  })
  note: string;
}
