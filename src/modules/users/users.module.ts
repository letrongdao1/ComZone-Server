import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users.entity';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Order } from 'src/entities/orders.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, WalletDeposit, Order])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
