// cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from '../../entities/carts.entity';

import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Comic } from 'src/entities/comics.entity';
import { User } from 'src/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Comic, User])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
