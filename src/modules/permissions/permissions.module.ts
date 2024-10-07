import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from 'src/entities/permissions.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Role } from 'src/entities/roles.entity';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role]), RolesModule],
  providers: [PermissionsService],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
