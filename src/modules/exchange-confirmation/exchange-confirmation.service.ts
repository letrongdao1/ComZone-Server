import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { Repository } from 'typeorm';
import { ExchangesService } from '../exchanges/exchanges.service';
import { BaseService } from 'src/common/service.base';
import { CreateConfirmationDTO } from './dto/exc-confirmation.dto';
import { UsersService } from '../users/users.service';
import { ExchangeStatusEnum } from '../exchanges/dto/exchange-status-enum';
import { DepositsService } from '../deposits/deposits.service';
import { ExchangeComicsService } from '../exchange-comics/exchange-comics.service';

@Injectable()
export class ExchangeConfirmationService extends BaseService<ExchangeConfirmation> {
  constructor(
    @InjectRepository(ExchangeConfirmation)
    private readonly excConfirmationRepository: Repository<ExchangeConfirmation>,
    private readonly usersService: UsersService,
    private readonly exchangesService: ExchangesService,
    private readonly comicsService: ExchangeComicsService,
    private readonly depositsService: DepositsService,
  ) {
    super(excConfirmationRepository);
  }

  async createNewConfirmation(userId: string, dto: CreateConfirmationDTO) {
    const exchange = await this.exchangesService.getOne(dto.exchangeId);
    if (!exchange) throw new NotFoundException();

    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException();

    if (!exchange.compensationAmount && !exchange.depositAmount)
      await this.exchangesService.updateDeals(dto.exchangeId, {
        compensateUser: dto.compensateUser,
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

  async rejectDeals(exchangeId: string) {
    const exchangeConfirmation = await this.excConfirmationRepository.findBy({
      exchange: { id: exchangeId },
    });
    await this.exchangesService.updateDeals(exchangeId, {
      compensationAmount: null,
      depositAmount: null,
      compensateUser: null,
    });

    return await this.excConfirmationRepository.remove(exchangeConfirmation);
  }

  async getByUserAndExchange(userId: string, exchangeId: string) {
    return await this.excConfirmationRepository.findOne({
      where: {
        user: { id: userId },
        exchange: { id: exchangeId },
      },
      relations: ['exchange', 'user'],
    });
  }

  async updateDeliveryConfirmation(userId: string, exchangeId: string) {
    const exchangeConfirmation = await this.excConfirmationRepository.findOne({
      where: {
        exchange: { id: exchangeId },
        user: { id: userId },
      },
    });
    await this.excConfirmationRepository.update(exchangeConfirmation.id, {
      deliveryConfirm: true,
    });

    //Auto-update exchange status
    const check = await this.excConfirmationRepository.find({
      where: {
        exchange: { id: exchangeId },
      },
    });

    if (
      check.length === 2 &&
      check[0].deliveryConfirm === true &&
      check[1].deliveryConfirm === true
    ) {
      await this.depositsService.refundAllDepositsOfAnExchange(exchangeId);
      await this.exchangesService.transferCompensationAmount(exchangeId);
      await this.comicsService.completeExchangeComics(exchangeId);

      await this.exchangesService.updateExchangeStatus(
        exchangeId,
        ExchangeStatusEnum.SUCCESSFUL,
      );
    }

    return await this.getOne(exchangeConfirmation.id);
  }

  async failedDeliveryMark(userId: string, exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);

    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const exchangeConfirmation = await this.excConfirmationRepository.findOneBy(
      {
        exchange: { id: exchangeId },
        user: { id: userId },
      },
    );

    return await this.excConfirmationRepository
      .update(exchangeConfirmation.id, {
        deliveryConfirm: false,
      })
      .then(() => this.getOne(exchangeConfirmation.id));
  }

  async cancelExchange(exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);

    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const exchangeConfirmations = await this.excConfirmationRepository.findBy({
      exchange: { id: exchangeId },
    });

    await this.excConfirmationRepository.remove(exchangeConfirmations);

    await this.comicsService.updateComicsToInitStatus(exchangeId);

    return await this.exchangesService
      .updateExchangeStatus(exchangeId, ExchangeStatusEnum.FAILED)
      .then(() => this.exchangesService.getOne(exchangeId));
  }
}
