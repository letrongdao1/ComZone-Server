import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Permission } from 'src/entities/permissions.entity';
import { Role } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';
import { PermissionDTO } from './dto/permissionDTO';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {
    super(permissionsRepository);
  }

  async createNewPermission(dto: PermissionDTO) {
    if (typeof dto.roles === 'number') {
      if (dto.roles > 4 || dto.roles < 1) {
        throw new BadRequestException('Invalid role id!');
      }
    } else if (dto.roles.find((id) => id < 1 || id > 4)) {
      throw new BadRequestException('Array consists of invalid role id(s)!');
    } else {
      const roles = await this.rolesRepository.find({
        where: dto.roles.map((id) => ({ id })),
      });

      const newPermission = this.permissionsRepository.create({
        permission_description: dto.permission_description,
        roles,
      });

      return await this.permissionsRepository.save(newPermission);
    }
  }
}
