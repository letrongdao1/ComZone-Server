import { Module } from '@nestjs/common';
import { SourcesOfFundService } from './sources-of-fund.service';
import { SourcesOfFundController } from './sources-of-fund.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceOfFund } from 'src/entities/source-of-fund.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SourceOfFund]), UsersModule],
  controllers: [SourcesOfFundController],
  providers: [SourcesOfFundService],
  exports: [SourcesOfFundService],
})
export class SourcesOfFundModule {}
