import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Permission } from 'src/entities/permissions.entity';
import { Role } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly rolesService: RolesService,
  ) {
    super(permissionsRepository);
  }

  async createNewPermission(
    permission_description: string,
    role: string | string[],
  ) {
    if (typeof role === 'string') {
      const newPermission = {
        permission_description,
        roles: [await this.rolesService.getRoleByName(role)],
      };
      console.log(newPermission);
      return await this.permissionsRepository.save(newPermission);
    } else {
      role.map(async (r) => {
        const newPermission = {
          permission_description,
          roles: [],
        };
        return await this.permissionsRepository.save(newPermission);
      });
    }
  }
}
