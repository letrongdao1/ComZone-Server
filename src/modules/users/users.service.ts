import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly accountRepository: Repository<User>,
  ) {
    super(accountRepository);
  }
  findAccountByEmail(email: string) {
    return this.accountRepository.findOne({
      where: {
        email: email,
      },
    });
  }
}
