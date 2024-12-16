// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';
// import { BaseLightningService } from './base-lightning.service';
// import { LightningPaymentResponse } from '../interfaces/withdraw.interface';

// @Injectable()
// export class LnbitsLightningService extends BaseLightningService {
//   constructor(private configService: ConfigService) {
//     super();
//   }

//   async payInvoice(bolt11: string): Promise<LightningPaymentResponse> {
//     try {
//       const response = await axios.post(
//         `${this.configService.get('lightning.lnbitsUrl')}/api/v1/payments`,
//         { out: true, bolt11 },
//         {
//           headers: {
//             'X-Api-Key': this.configService.get('lightning.apiKey'),
//           },
//         },
//       );

//       return {
//         status: 'OK',
//         payment_hash: response.data.payment_hash,
//       };
//     } catch (error) {
//       throw new Error('Lightning payment failed');
//     }
//   }
// }
//==============================================================================

/**
 * This service extends a generic LightningBackend object.
 * LightningBackend is intended here as the basic interface which defines withdraw operations.
 * Here we are extending LightningBackend to implement withdraw operations through a LNBits instance.
 * In the future, we could extends LightningBackend to implement withdraw operations through other lightning services.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as lnurl from 'lnurl';
import { LightningBackend } from 'lnurl';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

class LNBitsBackend extends LightningBackend {
  private options: { apiKey: string; url: string };

  constructor(options: { apiKey: string; url: string }) {
    super('lnbits', options, {
      defaultOptions: {
        apiKey: null,
        url: null,
      },
      requiredOptions: ['apiKey', 'url'],
    });
  }

  async payInvoice(invoice) {
    try {
      const response = await axios.post(
        `${this.options.url}/api/v1/payments`,
        { out: true, bolt11: invoice },
        { headers: { 'X-Api-Key': this.options.apiKey } },
      );
      return response.data.payment_hash;
    } catch (error) {
      throw new Error('Failed to pay invoice');
    }
  }

  checkOptions(options) {
    console.log(options);
    // This is called by the constructor.
    // Throw an error if any problems are found with the given options.
  }

  getNodeUri() {
    // Options are available as follows:
    const { apiKey, url } = this.options;
    console.log(apiKey, url);
    return Promise.reject('Not implemented');
  }

  openChannel(remoteId, localAmt, pushAmt, makePrivate) {
    console.log(remoteId, localAmt, pushAmt, makePrivate);
    return Promise.reject('Not implemented');
  }

  addInvoice(amount, extra) {
    console.log(amount, extra);
    return Promise.reject('Not implemented');
  }

  getInvoiceStatus(paymentHash) {
    console.log(paymentHash);
    return Promise.reject('Not implemented');
  }
}

@Injectable()
export class LnbitsLightningService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  private lnurlServer: any;

  async onModuleInit() {
    this.lnurlServer = lnurl.createServer({
      // TODO: add the correct host and port from .env
      host: 'localhost',
      port: 3000,
      endpoint: '/generateWithdrawParams',
      listen: false,
      lightning: new LNBitsBackend({
        apiKey: this.configService.get('lightning.apiKey'),
        url: this.configService.get('lightning.lnbitsUrl'),
      }),
    });

    this.lnurlServer.on(
      'withdrawRequest',
      this.handleWithdrawRequest.bind(this),
    );
  }

  // TODO: add DB management for the following methods

  // 1) replace the manual "lnurl.encode()"
  async generateWithdrawUrl(params: {
    minWithdrawable: number;
    maxWithdrawable: number;
    defaultDescription: string;
  }) {
    return this.lnurlServer.generateNewUrl('withdrawRequest', params);
  }

  // 2) the client follow the url generate at step 1 and calls this method
  async handleWithdrawRequest(params) {
    const { minWithdrawable, maxWithdrawable, defaultDescription, k1 } = params;

    return {
      tag: 'withdrawRequest',
      callback: `https://your-server.com/withdraw/callback?k1=${k1}`,
      k1: k1,
      minWithdrawable: minWithdrawable,
      maxWithdrawable: maxWithdrawable,
      defaultDescription: defaultDescription,
    };
  }

  // 3) step2 callback handling
  async handleWithdrawCallback(k1: string, pr: string) {
    try {
      const paymentHash = await this.lnurlServer.lightning.payInvoice(pr);
      return { status: 'OK', paymentHash };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { status: 'ERROR', reason: 'Payment failed' };
    }
  }
}
