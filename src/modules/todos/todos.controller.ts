import { Body, Controller, Get, Post } from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  @Get('')
  async getAllTodos() {
    return this.todoService.getAllTodos();
  }

  @Post('')
  async createNewTodo(@Body() data: { title: string }) {
    return this.todoService.createNewTodo(data);
  }
}
