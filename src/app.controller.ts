import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Welcome to ComZone Server! Link to APIs: localhost:3000/api';
  }
}
