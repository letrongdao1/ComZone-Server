import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from 'src/entities/wallets.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet]), UsersModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
