import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { Repository } from 'typeorm';
import { ExchangesService } from '../exchanges/exchanges.service';
import { BaseService } from 'src/common/service.base';
import { CreateDTO } from './dto/exc-confirmation.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ExchangeConfirmationService extends BaseService<ExchangeConfirmation> {
  constructor(
    @InjectRepository(ExchangeConfirmation)
    private readonly excConfirmationRepository: Repository<ExchangeConfirmation>,
    private readonly exchangesService: ExchangesService,
    private readonly usersService: UsersService,
  ) {
    super(excConfirmationRepository);
  }

  async createNewConfirmation(dto: CreateDTO) {
    const exchange = await this.exchangesService.getOne(dto.exchangeId);
    if (!exchange) throw new NotFoundException();

    const user =
      exchange.requestUser.id === dto.userId
        ? exchange.requestUser
        : exchange.postUser.id === dto.userId
          ? exchange.postUser
          : null;
    if (!user) throw new NotFoundException();

    const newConfimation = this.excConfirmationRepository.create({
      exchange,
      user,
    });

    return await this.excConfirmationRepository.save(newConfimation);
  }

  async updateConfirmation() {}
}
