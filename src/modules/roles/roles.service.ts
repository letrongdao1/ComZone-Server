import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/roles.entity';
import { Repository } from 'typeorm';
import { RoleDTO } from './dto/roleDTO';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepository: Repository<Role>,
  ) {}

  async getAll() {
    return await this.rolesRepository.find();
  }

  async getOneById(id: number) {
    return await this.rolesRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async create(role: RoleDTO) {
    return await this.rolesRepository.save(role);
  }

  async getRoleByName(name: string) {
    return await this.rolesRepository.findOne({
      where: {
        role_name: name,
      },
    });
  }
}
