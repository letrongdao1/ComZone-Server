import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'todos' })
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({
    name: 'status',
    type: 'bool',
    nullable: false,
    default: false,
  })
  status: boolean;
}
