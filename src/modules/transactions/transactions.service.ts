import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {}
