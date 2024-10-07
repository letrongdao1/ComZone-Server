import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Role } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {
    super(rolesRepository);
  }

  async getRoleByName(name: string) {
    return await this.rolesRepository.findOne({
      where: {
        role_name: name,
      },
    });
  }
}
