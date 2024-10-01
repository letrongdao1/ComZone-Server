import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TodosService } from './todos.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  @Get('')
  async getAllTodos() {
    return this.todoService.getAll();
  }

  @Get('/title/:title')
  async getTodoByTitle(@Param('title') title: string) {
    return this.todoService.getTodoByTitle(title);
  }
  
  @Get(':id')
  async getTodoById(@Param('id') id: string) {
    return this.todoService.getOne(id);
  }

  @Post('')
  async createNewTodo(@Body() data: { title: string }) {
    return this.todoService.create(data);
  }

  @Delete('')
  async deleteTodo(@Param() id: string) {
    return this.todoService.softDelete(id);
  }
}
