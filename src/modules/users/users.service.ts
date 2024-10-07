import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {
    super(userRepository);
  }

  async getOne(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'phone',
        'is_verified',
        'role',
        'createdAt',
        'updatedAt',
        'refresh_token',
      ],
    });
  }

  async findAccountByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string) {
    return await this.userRepository.update(id, {
      refresh_token: hashedRefreshToken,
    });
  }

  async updateRoleToSeller(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('User cannot be found!');

    switch (user.role.id) {
      case 1: {
        const sellerRole = await this.rolesService.getOneById(2);
        return await this.userRepository.update(userId, {
          role: sellerRole,
        });
      }
      case 2: {
        return {
          message: 'This has already been a seller account!',
        };
      }
      default: {
        throw new ForbiddenException("This account's role cannot be updated!");
      }
    }
  }
}
