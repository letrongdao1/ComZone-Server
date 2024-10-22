import { BadRequestException, Injectable } from '@nestjs/common';
import { randomInt, createHmac } from 'crypto';
import * as dotenv from 'dotenv';
import dateFormat from '../../utils/date-format/date.format';
import { VNPayRequest } from './dto/vnp-payment-url-request';
import { TransactionsService } from '../transactions/transactions.service';

var querystring = require('qs');
dotenv.config();

@Injectable()
export class VnpayService {
  constructor(private readonly transactionsService: TransactionsService) {}

  sortObject(obj: any) {
    let sorted = {};
    let str = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }

  async createPaymentLink(
    userId: string,
    vnpayRequest: VNPayRequest,
    ipAddress: string,
    context: 'WALLET' | 'CHECKOUT',
  ) {
    if (
      !vnpayRequest.amount ||
      vnpayRequest.amount < 1000 ||
      vnpayRequest.amount > 99999999
    )
      throw new BadRequestException('Invalid VNPay request!');

    const newTransaction = await this.transactionsService.createNewTransaction(
      userId,
      {
        amount: vnpayRequest.amount,
        type: vnpayRequest.type,
        provider: 'VNPay',
      },
    );

    var tmnCode = process.env.VNPAY_TERMINAL_ID;
    var secretKey = process.env.VNPAY_SECRET_KEY;
    var vnpUrl = process.env.VNPAY_PAYMENT_URL;

    var createDate = dateFormat(new Date(), 'yyyymmddHHMMss');
    // var bankCode = 'VNBANK';
    var returnUrl =
      context === 'WALLET'
        ? `http://localhost:3000/vnpay/return/${newTransaction.id}`
        : `http://localhost:3000/vnpay/checkout/return/${newTransaction.id}`;

    var vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      //   vnp_BankCode: bankCode,
      vnp_TxnRef: newTransaction.code,
      vnp_OrderInfo: `${newTransaction.id}`,
      vnp_OrderType: 'ComZone purchase',
      vnp_Amount: vnpayRequest.amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddress,
      vnp_CreateDate: createDate,
    };

    vnpParams = this.sortObject(vnpParams);

    var signData: string = querystring.stringify(vnpParams, { encode: false });

    var hmac = createHmac('sha512', secretKey);
    var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    vnpUrl += '?' + querystring.stringify(vnpParams, { encode: false });

    return {
      message: 'A new payment link was created successfully.',
      url: vnpUrl,
      transaction: newTransaction,
    };
  }

  async handlePaymentReturn(
    req: any,
    response: any,
    transactionId: string,
    context: 'WALLET' | 'CHECKOUT',
  ) {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    var secretKey = process.env.VNPAY_SECRET_KEY;

    let signData = querystring.stringify(vnp_Params, { encode: false });

    let hmac = createHmac('sha512', secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash === signed) {
      await this.transactionsService.updateTransactionStatus(
        transactionId,
        vnp_Params['vnp_ResponseCode'] === '00' ? 'SUCCESSFUL' : 'FAILED',
      );

      if (vnp_Params['vnp_ResponseCode'] === '00') {
        response.redirect(
          context === 'WALLET'
            ? 'http://localhost:5173?payment_status=SUCCESSFUL'
            : 'http://localhost:5173/checkout?payment_status=SUCCESSFUL',
        );
      } else {
        response.redirect(
          context === 'WALLET'
            ? 'http://localhost:5173?payment_status=FAILED'
            : 'http://localhost:5173/checkout?payment_status=FAILED',
        );
      }
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
  }
}
