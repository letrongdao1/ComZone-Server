import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from '../../entities/todos.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
  ) {}

  async getAllTodos() {
    return await this.todoRepository.find();
  }

  async createNewTodo(data: { title: string }) {
    const todo = this.todoRepository.create(data);
    return await this.todoRepository.save(todo);
  }
}
