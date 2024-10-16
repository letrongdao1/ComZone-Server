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
import { DepositRequestDTO } from './dto/deposit-request';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class WalletsService extends BaseService<Wallet> {
  constructor(
    @InjectRepository(Wallet) private walletsRepository: Repository<Wallet>,
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService,
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

    if (!wallet) {
      return await this.createUserWallet(userId, {
        balance: 0,
        nonWithdrawableAmount: 0,
        status: 'ACTIVATED',
      });
    }

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

  async deposit(userId: string, depositRequest: DepositRequestDTO) {
    const wallet = await this.getUserWallet(userId);

    if (depositRequest.amount <= 0)
      throw new BadRequestException('Invalid deposit amount!');

    const transaction = await this.transactionsService.getTransactionByCode(
      depositRequest.transactionCode,
    );

    if (!transaction)
      throw new NotFoundException('Transaction cannot be found!');

    if (transaction.status.toUpperCase() === 'SUCCESSFUL') {
      return await this.walletsRepository.update(
        { id: wallet.id },
        { balance: depositRequest.amount },
      );
    } else {
      return {
        message: `Failed to deposit due to unsuccessful transaction ${depositRequest.transactionCode}`,
      };
    }
  }

  async withdraw(userId: string, amount: number) {
    const wallet = await this.getUserWallet(userId);

    if (amount <= 0) throw new BadRequestException('Invalid withdraw amount!');

    if (amount > wallet.balance - wallet.nonWithdrawableAmount)
      throw new BadRequestException('Insufficient balance!');

    const transaction = await this.transactionsService.createNewTransaction(
      userId,
      { amount, type: 'WITHDRAWAL', status: 'SUCCESSFUL' },
    );

    await this.walletsRepository.update(
      {
        id: wallet.id,
      },
      {
        balance: wallet.balance - amount,
      },
    );

    return {
      message: 'Successful withdrawal!',
      transaction,
    };
  }

  async updateNonWithdrawableAmount(userId: string, amount: number) {
    const wallet = await this.getUserWallet(userId);

    if (amount <= 0) throw new BadRequestException('Invalid amount!');
    if (amount > wallet.balance)
      throw new BadRequestException(
        'Non-withdrawable amount cannot be greater than the current balance!',
      );

    return await this.walletsRepository.update(
      {
        id: wallet.id,
      },
      { nonWithdrawableAmount: wallet.nonWithdrawableAmount + amount },
    );
  }
}
