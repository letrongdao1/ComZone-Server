import { Injectable } from '@nestjs/common';
import { createHmac, randomInt } from 'crypto';
import axios from 'axios';

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

  async createPaymentLink(data2: any) {
    const embeddata = {
      redirecturl: 'https://www.google.com',
      merchantinfo: 'embeddata123',
      // bankgroup: 'ATM',
    };

    const items = [
      {
        itemid: 'knb',
        itemname: 'kim nguyen bao',
        itemprice: 198400,
        itemquantity: 1,
      },
    ];

    const order = {
      appid: this.config.appid,
      apptransid: `241012_${randomInt(1000000, 9999999999)}`,
      appuser: 'demo',
      apptime: Date.now(),
      item: JSON.stringify(items),
      embeddata: JSON.stringify(embeddata),
      amount: 50000,
      description: 'ZaloPay Integration Demo',
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

    axios
      .post(this.config.createOrderEndpoint, null, { params: order })
      .then((res) => {
        console.log(res.data);
      });
  }

  async getPaymentStatus(appTransId: string) {
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
