/* eslint-disable no-var */
import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import axios from 'axios';
import dateFormat from 'src/utils/date-format/date.format';
import { ZaloPayRequest } from './dto/zalopay-payment-url-request';
import { WalletDepositService } from '../wallet-deposit/wallet-deposit.service';
import { generateNumericCode } from 'src/utils/generator/generators';
import { PaymentGatewayEnum } from '../wallet-deposit/dto/provider.enum';
import { WalletDepositStatusEnum } from '../wallet-deposit/dto/status.enum';

@Injectable()
export class ZalopayService {
  constructor(private readonly walletDepositsService: WalletDepositService) {}

  private readonly config = {
    appid: '554',
    key1: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn',
    key2: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny',
    createOrderEndpoint: 'https://sandbox.zalopay.com.vn/v001/tpe/createorder',
    getStatusEndpoint:
      'https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid',
  };

  async createPaymentLink(
    userId: string,
    zaloPayRequest: ZaloPayRequest,
    context: 'WALLET' | 'CHECKOUT',
  ) {
    const walletDeposit = await this.walletDepositsService.getOne(
      zaloPayRequest.walletDeposit,
    );

    const embeddata = {
      redirecturl:
        context === 'WALLET'
          ? `${process.env.SERVER_URL}/zalopay/status/${walletDeposit.id}`
          : `${process.env.SERVER_URL}/zalopay/checkout/status/${walletDeposit.id}`,
      merchantinfo: 'ComZoneZaloPay',
    };

    const items = [];

    const createDate = dateFormat(new Date(), 'yymmdd');

    const order = {
      appid: this.config.appid,
      apptransid: `${createDate}_${generateNumericCode(16)}`,
      appuser: 'demo',
      apptime: Date.now(),
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: walletDeposit.amount,
      description: `ComZone ZaloPay`,
      bankcode: '',
      mac: '',
    };

    const data =
      this.config.appid +
      '|' +
      order.apptransid +
      '|' +
      order.appuser +
      '|' +
      order.amount +
      '|' +
      order.apptime +
      '|' +
      order.embeddata +
      '|' +
      order.item;

    order.mac = createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex');

    var url = new URL(this.config.createOrderEndpoint);

    Object.keys(order).forEach((key) =>
      url.searchParams.append(key, order[key]),
    );

    const urlRequest = await fetch(url.toString(), {
      method: 'POST',
    });

    return await urlRequest.json();
  }

  async getPaymentStatus(
    req: any,
    response: any,
    walletDepositId: string,
    context: 'WALLET' | 'CHECKOUT',
  ) {
    const appTransId = req.query.apptransid;

    const macStr =
      this.config.appid + '|' + appTransId + '|' + this.config.key1;
    const mac = createHmac('sha256', this.config.key1)
      .update(macStr)
      .digest('hex');
    await axios
      .post(
        this.config.getStatusEndpoint,
        {
          appid: this.config.appid,
          apptransid: appTransId,
          mac,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then(async (res) => {
        console.log('LOG: ', res.data);

        await this.walletDepositsService.updateProvider(
          walletDepositId,
          PaymentGatewayEnum.ZALOPAY,
        );

        if (res.data.returncode === 1) {
          await this.walletDepositsService.updateWalletDepositStatus(
            walletDepositId,
            WalletDepositStatusEnum.SUCCESSFUL,
          );

          response.redirect(
            context === 'WALLET'
              ? `${process.env.CLIENT_URL}?payment_status=SUCCESSFUL`
              : `${process.env.CLIENT_URL}/checkout?payment_status=SUCCESSFUL`,
          );
        } else {
          await this.walletDepositsService.updateWalletDepositStatus(
            walletDepositId,
            WalletDepositStatusEnum.FAILED,
          );

          response.redirect(
            context === 'WALLET'
              ? `${process.env.CLIENT_URL}?payment_status=FAILED`
              : `${process.env.CLIENT_URL}/checkout?payment_status=FAILED`,
          );
        }
      })
      .catch((err) => console.log(err));
  }
}
