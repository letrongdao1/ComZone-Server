/* eslint-disable prefer-const */
/* eslint-disable no-var */
import { Injectable, NotFoundException } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as dotenv from 'dotenv';
import dateFormat from '../../utils/date-format/date.format';
import { VNPayRequestDTO } from './dto/vnp-payment-url-request';
import { WalletDepositService } from '../wallet-deposit/wallet-deposit.service';
import { generateNumericCode } from 'src/utils/generator/generators';
import { PaymentGatewayEnum } from '../wallet-deposit/dto/provider.enum';
import { WalletDepositStatusEnum } from '../wallet-deposit/dto/status.enum';

// eslint-disable-next-line @typescript-eslint/no-require-imports
var querystring = require('qs');
dotenv.config();

@Injectable()
export class VnpayService {
  constructor(private readonly walletDepositsService: WalletDepositService) {}

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
    vnpayRequest: VNPayRequestDTO,
    ipAddress: string,
    context: 'WALLET' | 'CHECKOUT',
  ) {
    var tmnCode = process.env.VNPAY_TERMINAL_ID;
    var secretKey = process.env.VNPAY_SECRET_KEY;
    var vnpUrl = process.env.VNPAY_PAYMENT_URL;

    const walletDeposit = await this.walletDepositsService.getOne(
      vnpayRequest.walletDeposit,
    );

    if (!walletDeposit)
      throw new NotFoundException('Wallet deposit cannot be found!');

    var createDate = dateFormat(new Date(), 'yyyymmddHHMMss');
    var returnUrl =
      context === 'WALLET'
        ? `${process.env.SERVER_URL}/vnpay/return/${walletDeposit.id}`
        : `${process.env.SERVER_URL}/vnpay/checkout/return/${walletDeposit.id}`;

    var vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: generateNumericCode(16),
      vnp_OrderInfo: `${walletDeposit.id}`,
      vnp_OrderType: 'ComZone purchase',
      vnp_Amount: walletDeposit.amount * 100,
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
      walletDeposit,
    };
  }

  async handlePaymentReturn(
    req: any,
    response: any,
    walletDepositId: string,
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
      await this.walletDepositsService.updateProvider(
        walletDepositId,
        PaymentGatewayEnum.VNPAY,
      );

      await this.walletDepositsService.updateWalletDepositStatus(
        walletDepositId,
        vnp_Params['vnp_ResponseCode'] === '00'
          ? WalletDepositStatusEnum.SUCCESSFUL
          : WalletDepositStatusEnum.FAILED,
      );

      if (vnp_Params['vnp_ResponseCode'] === '00') {
        response.redirect(
          context === 'WALLET'
            ? `${process.env.CLIENT_URL}?payment_status=SUCCESSFUL`
            : `${process.env.CLIENT_URL}/checkout?payment_status=SUCCESSFUL`,
        );
      } else {
        response.redirect(
          context === 'WALLET'
            ? `${process.env.CLIENT_URL}?payment_status=FAILED`
            : `${process.env.CLIENT_URL}/checkout?payment_status=FAILED`,
        );
      }
    } else {
      response.redirect(
        context === 'WALLET'
          ? `${process.env.CLIENT_URL}?payment_status=FAILED`
          : `${process.env.CLIENT_URL}/checkout?payment_status=FAILED`,
      );
    }
  }
}
