import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { User } from 'src/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async createMemberAccount(user: any): Promise<User> {
    const newUser = {
      ...user,
      role: 'MEMBER',
    };
    return await this.userRepository.save(newUser);
  }

  async getOne(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'phone',
        'avatar',
        'role',
        'is_verified',
        'balance',
        'nonWithdrawableAmount',
        'createdAt',
        'updatedAt',
        'refresh_token',
      ],
    });
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async getUserRole(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['role'],
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

    if (!user.is_verified)
      throw new ForbiddenException(
        'Phone number must be verified to get a seller account!',
        'Unverified phone number!',
      );

    switch (user.role) {
      case 'MEMBER': {
        await this.userRepository.update(userId, {
          role: 'SELLER',
        });

        return await this.userRepository.findOne({ where: { id: userId } });
      }
      case 'SELLER': {
        return {
          error: 'Unnecessary request!',
          message: 'This has already been a seller account!',
        };
      }
      default: {
        throw new ForbiddenException("This account's role cannot be updated!");
      }
    }
  }

  async updateLastActive(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('User cannot be found!');

    await this.userRepository.update(userId, {
      last_active: new Date().toLocaleString(),
    });
  }
}
