import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../../entities/todos.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/service.base';

@Injectable()
export class TodosService extends BaseService<Todo> {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
  ) {
    super(todoRepository);
  }

  async getTodoByTitle(title: string) {
    return await this.todoRepository.find({
      where: {
        title: title,
      },
    });
  }
}
