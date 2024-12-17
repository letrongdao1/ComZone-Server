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
import { EventsGateway } from '../socket/event.gateway';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';

@Injectable()
export class ExchangeConfirmationService extends BaseService<ExchangeConfirmation> {
  constructor(
    @InjectRepository(ExchangeConfirmation)
    private readonly excConfirmationRepository: Repository<ExchangeConfirmation>,
    private readonly usersService: UsersService,
    private readonly exchangesService: ExchangesService,
    private readonly comicsService: ExchangeComicsService,
    private readonly depositsService: DepositsService,
    private readonly eventsGateway: EventsGateway,
  ) {
    super(excConfirmationRepository);
  }

  async createNewConfirmation(userId: string, dto: CreateConfirmationDTO) {
    const exchange = await this.exchangesService.getOne(dto.exchangeId);
    if (!exchange) throw new NotFoundException();

    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException();

    if (!exchange.compensationAmount && !exchange.depositAmount) {
      await this.exchangesService.updateDeals(dto.exchangeId, {
        compensateUser: dto.compensateUser,
        compensationAmount: dto.compensationAmount,
        depositAmount: dto.depositAmount,
      });

      await this.eventsGateway.notifyUser(
        exchange.post.user.id,
        'Bạn có một cuộc trao đổi nhận được thỏa thuận tiền cọc và tiền bù mới. Xem ngay!',
        { exchangeId: exchange.id },
        'Thỏa thuận trao đổi mới',
        AnnouncementType.EXCHANGE_NEW_DEAL,
        RecipientType.USER,
      );
    } else {
      await this.eventsGateway.notifyUser(
        exchange.requestUser.id,
        'Bạn có một cuộc trao đổi mà thỏa thuận tiền cọc và tiền bù của bạn đã được chấp thuận. Hãy tiến hành xác nhận địa chỉ để tiếp tục trao đổi!',
        { exchangeId: exchange.id },
        'Thỏa thuận trao đổi được chấp thuận',
        AnnouncementType.EXCHANGE_NEW_DEAL,
        RecipientType.USER,
      );
    }

    const newConfimation = this.excConfirmationRepository.create({
      exchange,
      user,
      dealingConfirm: true,
    });

    return await this.excConfirmationRepository.save(newConfimation);
  }

  async rejectDeals(exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const exchangeConfirmation = await this.excConfirmationRepository.findBy({
      exchange: { id: exchangeId },
    });
    await this.exchangesService.updateDeals(exchangeId, {
      compensationAmount: null,
      depositAmount: null,
      compensateUser: null,
    });

    await this.eventsGateway.notifyUser(
      exchange.requestUser.id,
      'Bạn có một cuộc trao đổi mà thỏa thuận tiền cọc và tiền bù của bạn đã bị người đăng bài từ chối! Hãy tiến hành thương lượng và đặt mức thỏa thuận mới!',
      { exchangeId: exchange.id },
      'Thỏa thuận trao đổi bị từ chối',
      AnnouncementType.EXCHANGE_REJECTED,
      RecipientType.USER,
    );

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
    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

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

      const userIdToAnnounce =
        exchange.requestUser.id === userId
          ? exchange.post.user.id
          : exchange.requestUser.id;

      await this.eventsGateway.notifyUser(
        userIdToAnnounce,
        'Bạn có một cuộc trao đổi đã hoàn tất thành công. Bạn có thể kiểm tra các khoản tiền đã được chuyển vào ví của bạn.',
        { exchangeId: exchange.id },
        'Trao đổi thành công',
        AnnouncementType.EXCHANGE_SUCCESSFUL,
        RecipientType.USER,
      );
    }

    return await this.getOne(exchangeConfirmation.id);
  }

  async updatePackagingImages(
    userId: string,
    exchangeId: string,
    packagingImages: string[],
  ) {
    const exchangeConfirmation = await this.excConfirmationRepository.findOne({
      where: {
        user: { id: userId },
        exchange: { id: exchangeId },
      },
    });

    if (!exchangeConfirmation)
      throw new NotFoundException('Exchange confirmation cannot be found!');

    return await this.excConfirmationRepository
      .update(exchangeConfirmation.id, {
        packagingImages,
      })
      .then(() => this.getOne(exchangeConfirmation.id));
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

    await this.excConfirmationRepository.update(exchangeConfirmation.id, {
      deliveryConfirm: false,
    });

    //Auto-update exchange status
    const check = await this.excConfirmationRepository.find({
      where: {
        exchange: { id: exchangeId },
      },
      relations: ['user', 'exchange'],
    });

    if (
      check.length === 2 &&
      check.some((confirmation) => confirmation.deliveryConfirm === false)
    ) {
      await this.depositsService.refundAllDepositsOfAnExchange(exchangeId);
      await this.exchangesService.transferCompensationAmount(exchangeId);
      await this.comicsService.completeExchangeComics(exchangeId);

      await this.exchangesService.updateExchangeStatus(
        exchangeId,
        ExchangeStatusEnum.FAILED,
      );

      const getAnnouncementMessage = (userId: string) => {
        if (
          check.some(
            (confirmation) =>
              confirmation.user.id === userId &&
              confirmation.deliveryConfirm === false,
          )
        ) {
          return {
            message:
              'Giao hàng không thành công. Chúng tôi đã không liên lạc thành công đến bạn để giao hàng. Truyện trao đổi sẽ được hoàn lại cho người gửi và hệ thống đã hoàn các khoản tiền cho bạn trừ phí giao hàng.',
            type: AnnouncementType.EXCHANGE_FAILED,
          };
        } else {
          return {
            message:
              'Bạn có một cuộc trao đổi đã hoàn tất. Vì chúng tôi không giao hàng cho người nhận truyện của bạn được nên truyện sẽ được hoàn trả lại đến bạn. Bạn có thể kiểm tra các khoản tiền đã được chuyển vào ví của bạn.',
            type: AnnouncementType.EXCHANGE_SUCCESSFUL,
          };
        }
      };

      await this.eventsGateway.notifyUser(
        exchange.requestUser.id,
        getAnnouncementMessage(exchange.requestUser.id).message,
        { exchangeId: exchange.id },
        'Trao đổi hoàn tất',
        getAnnouncementMessage(exchange.requestUser.id).type,
        RecipientType.USER,
      );

      await this.eventsGateway.notifyUser(
        exchange.post.user.id,
        getAnnouncementMessage(exchange.post.user.id).message,
        { exchangeId: exchange.id },
        'Trao đổi hoàn tất',
        getAnnouncementMessage(exchange.post.user.id).type,
        RecipientType.USER,
      );
    }

    return await this.getOne(exchangeConfirmation.id);
  }

  async cancelExchange(userId: string, exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);

    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const exchangeConfirmations = await this.excConfirmationRepository.findBy({
      exchange: { id: exchangeId },
    });

    await this.excConfirmationRepository.remove(exchangeConfirmations);

    await this.comicsService.updateComicsToInitStatus(exchangeId);

    const userIdToAnnounce =
      exchange.requestUser.id === userId
        ? exchange.post.user.id
        : exchange.requestUser.id;

    await this.eventsGateway.notifyUser(
      userIdToAnnounce,
      'Bạn có một cuộc trao đổi đã bị hủy bỏ vì người thực hiện trao đổi với bạn đã không còn tiếp tục trao đổi với bạn.',
      { exchangeId: exchange.id },
      'Trao đổi bị hủy bỏ',
      AnnouncementType.EXCHANGE_FAILED,
      RecipientType.USER,
    );

    return await this.exchangesService
      .updateExchangeStatus(exchangeId, ExchangeStatusEnum.FAILED)
      .then(() => this.exchangesService.getOne(exchangeId));
  }
}
