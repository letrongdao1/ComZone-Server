import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Wallet } from 'src/entities/wallets.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { WalletDTO } from './dto/wallet';
import { DepositRequest } from './dto/deposit-request';

@Injectable()
export class WalletsService extends BaseService<Wallet> {
  constructor(
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    private readonly usersService: UsersService,
  ) {
    super(walletsRepository);
  }

  async getUserWallet(userId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const wallet = this.walletsRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      select: [
        'id',
        'user',
        'balance',
        'nonWithdrawableAmount',
        'status',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    });

    if (!wallet) throw new NotFoundException('User wallet cannot be found!');

    return wallet;
  }

  async createUserWallet(
    userId: string,
    walletDto: WalletDTO,
  ): Promise<Wallet> {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const checkWallet = await this.getUserWallet(userId);
    if (checkWallet)
      throw new ConflictException(
        'Try to make updates instead!',
        'This user already had a wallet!',
      );

    const wallet = this.walletsRepository.create({
      user,
      balance: walletDto.balance,
      nonWithdrawableAmount: walletDto.nonWithdrawableAmount,
      status: walletDto.status,
    });

    return this.walletsRepository.save(wallet);
  }

  async deposit(userId: string, depositRequest: DepositRequest) {
    const checkWallet = await this.getUserWallet(userId);
    if (!checkWallet) throw new NotFoundException('Wallet cannot be found!');

    if (depositRequest.amount <= 0)
      throw new BadRequestException('Invalid deposit amount!');

    
  }
}
