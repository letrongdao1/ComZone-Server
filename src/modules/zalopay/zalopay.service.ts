import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, randomInt } from 'crypto';
import axios from 'axios';
import dateFormat from 'src/utils/date-format/date.format';
import { ZaloPayRequest } from './dto/zalopay-payment-url-request';
import { TransactionsService } from '../transactions/transactions.service';
import { WalletsService } from '../wallets/wallets.service';
import { Wallet } from 'src/entities/wallets.entity';

@Injectable()
export class ZalopayService {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
  ) {}

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
    if (
      !zaloPayRequest.amount ||
      zaloPayRequest.amount < 1000 ||
      zaloPayRequest.amount > 99999999
    )
      throw new BadRequestException('Invalid ZaloPay request!');

    const newTransaction = await this.transactionsService.createNewTransaction(
      userId,
      {
        amount: zaloPayRequest.amount,
        type: zaloPayRequest.type,
        provider: 'Zalopay',
      },
    );

    const embeddata = {
      redirecturl:
        context === 'WALLET'
          ? `http://localhost:3000/zalopay/status/${newTransaction.id}`
          : `http://localhost:3000/zalopay/checkout/status/${newTransaction.id}`,
      merchantinfo: 'ComZoneZaloPay',
    };

    const items = [];

    const createDate = dateFormat(new Date(), 'yymmdd');

    const order = {
      appid: this.config.appid,
      apptransid: `${createDate}_${newTransaction.code}`,
      appuser: 'demo',
      apptime: Date.now(),
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: zaloPayRequest.amount,
      description: `ComZone ZaloPay Order ${newTransaction.code}`,
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
    transactionId: string,
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

        if (res.data.returncode === 1) {
          await this.transactionsService.updateTransactionStatus(
            transactionId,
            'SUCCESSFUL',
          );

          const transaction =
            await this.transactionsService.getOne(transactionId);

          const wallet: Wallet = await this.walletsService.getUserWallet(
            transaction.user.id,
          );

          await this.walletsService.deposit(wallet.user.id, {
            transactionCode: transaction.code,
          });

          response.redirect(
            context === 'WALLET'
              ? 'http://localhost:5173?payment_status=SUCCESSFUL'
              : 'http://localhost:5173/checkout?payment_status=SUCCESSFUL',
          );
        } else {
          await this.transactionsService.updateTransactionStatus(
            transactionId,
            'FAILED',
          );
          response.redirect(
            context === 'WALLET'
              ? 'http://localhost:5173?payment_status=FAILED'
              : 'http://localhost:5173/checkout?payment_status=FAILED',
          );
        }
      })
      .catch((err) => console.log(err));
  }
}
