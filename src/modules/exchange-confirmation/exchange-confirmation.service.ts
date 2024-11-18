import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { Repository } from 'typeorm';
import { ExchangesService } from '../exchanges/exchanges.service';
import { BaseService } from 'src/common/service.base';
import { CreateConfirmationDTO } from './dto/exc-confirmation.dto';
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

  async createNewConfirmation(userId: string, dto: CreateConfirmationDTO) {
    const exchange = await this.exchangesService.getOne(dto.exchangeId);
    if (!exchange) throw new NotFoundException();

    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException();

    await this.exchangesService.updateDeals(userId, dto.exchangeId, {
      compensationAmount: dto.compensationAmount,
      depositAmount: dto.depositAmount,
    });

    const newConfimation = this.excConfirmationRepository.create({
      exchange,
      user,
      dealingConfirm: true,
    });

    return await this.excConfirmationRepository.save(newConfimation);
  }

  async getByUserAndExchange(userId: string, exchangeId: string) {
    return await this.excConfirmationRepository.findOne({
      where: {
        user: { id: userId },
        exchange: { id: exchangeId },
      },
    });
  }

  async updateDeliveryConfirmation(userId: string, exchangeId: string) {
    const exchangeConfirmation = await this.excConfirmationRepository.findOne({
      where: {
        exchange: { id: exchangeId },
        user: { id: userId },
      },
    });
    return await this.excConfirmationRepository
      .update(exchangeConfirmation.id, {
        deliveryConfirm: true,
      })
      .then(() => this.getOne(exchangeConfirmation.id));
  }
}
