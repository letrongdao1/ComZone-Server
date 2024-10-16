import { BadRequestException, Injectable } from '@nestjs/common';
import { createHmac, randomInt } from 'crypto';
import axios from 'axios';
import dateFormat from 'src/tools/date-format/date.format';
import { ZaloPayRequest } from './dto/zalopay-payment-url-request';

@Injectable()
export class ZalopayService {
  private readonly config = {
    appid: '554',
    key1: '8NdU5pG5R2spGHGhyO99HN1OhD8IQJBn',
    key2: 'uUfsWgfLkRLzq6W2uNXTCxrfxs51auny',
    createOrderEndpoint: 'https://sandbox.zalopay.com.vn/v001/tpe/createorder',
    getStatusEndpoint:
      'https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid',
  };

  async createPaymentLink(zaloPayRequest: ZaloPayRequest) {
    if (
      !zaloPayRequest.amount ||
      zaloPayRequest.amount < 1000 ||
      zaloPayRequest.amount > 99999999 ||
      !zaloPayRequest.orderId ||
      zaloPayRequest.orderId.length < 3 ||
      zaloPayRequest.orderId.length > 20
    )
      throw new BadRequestException('Invalid ZaloPay request!');

    const embeddata = {
      redirecturl: 'http://localhost:3000/zalopay/status',
      merchantinfo: 'ComZoneZaloPay',
    };

    const items = [];

    const createDate = dateFormat(new Date(), 'yymmdd');

    const order = {
      appid: this.config.appid,
      apptransid: `${createDate}_${zaloPayRequest.orderId}`,
      appuser: 'demo',
      apptime: Date.now(),
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: zaloPayRequest.amount,
      description: `ComZone ZaloPay Order ${zaloPayRequest.orderId}`,
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

    return await axios
      .post(this.config.createOrderEndpoint, null, { params: order })
      .then((res) => {
        console.log(res.data);
      });
  }

  async getPaymentStatus(req: any) {
    console.log(req.query);
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
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  }
}
