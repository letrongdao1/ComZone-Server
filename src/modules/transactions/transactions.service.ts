import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { TransactionDTO } from './dto/transactionDto';
import { generateNumericCode } from '../../utils/generator/generators';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
  ) {
    super(transactionsRepository);
  }

  async createNewTransaction(userId, transactionDto: TransactionDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      ...transactionDto,
      user,
      code: generateNumericCode(8),
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async getAllTransactionsOfUser(userId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    return await this.transactionsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async getTransactionByCode(code: string) {
    return await this.transactionsRepository.findOne({
      where: { code },
    });
  }

  async updateTransactionStatus(
    transactionId: string,
    newStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED',
  ) {
    const transaction = await this.transactionsRepository.findOne({
      where: {
        id: transactionId,
      },
    });

    if (!transaction)
      throw new NotFoundException('Transaction cannot be found!');

    if (transaction.status === newStatus)
      return {
        message: `This transaction status has already been '${newStatus}'`,
      };

    return await this.transactionsRepository.update(
      { id: transactionId },
      { status: newStatus },
    );
  }
}
