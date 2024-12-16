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
import { LNBitsGenerateWithdrawUrlResponse } from '../interfaces/withdraw.interface';

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
      // TODO: define host and port from in .env
      host: 'localhost',
      port: 3000,
      endpoint: '/generateWithdrawParams',
      listen: false,
      lightning: new LNBitsBackend({
        apiKey: this.configService.get('lightning.apiKey'),
        url: this.configService.get('lightning.lnbitsUrl'),
      }),
    });
  }

  // TODO: add DB management for the following methods

  // 1) Generate withdraw url
  async generateWithdrawUrl(params: {
    minWithdrawable: number;
    maxWithdrawable: number;
    defaultDescription: string;
  }): Promise<LNBitsGenerateWithdrawUrlResponse> {
    // Todo: check validity of request, check funds...
    return this.lnurlServer.generateNewUrl('withdrawRequest', params);
  }

  // 2) The user's wallet follow the url generate at step 1 and calls this method to get withdraw params
  async handleWithdrawRequest(params) {
    // Note: k1 is the "secret" param generated in the previous "this.lnurlServer.generateNewUrl" step.
    const { minWithdrawable, maxWithdrawable, defaultDescription, k1 } = params;

    return {
      tag: 'withdrawRequest',
      // Note: when the wallet calls this callback url
      // it will automatically append also the "pr" param as a query param.
      // TODO: verify this is really the case (are we getting the "pr" param when the wallet calls the callback?)
      callback: `${this.configService.get('app.baseUrl')}/withdraw/callback?k1=${k1}`,
      k1: k1,
      minWithdrawable: minWithdrawable,
      maxWithdrawable: maxWithdrawable,
      defaultDescription: defaultDescription,
    };
  }

  // 3) Callback handling
  /**
   * As noted in the previous step (handleWithdrawRequest):
   * when the wallet calls the callback url, it will automatically append also the "pr" param as a query param.
   
    The flow for obtaining the "pr" parameter is as follows:
      - The server generates a withdraw URL using server.generateNewUrl('withdrawRequest').
      - The user's wallet accesses this URL and receives a JSON response (by the handleWithdrawRequest method) containing withdrawal parameters.
      - The wallet should now generate a bolt11 invoice, and send a GET request to the callback URL, including the "pr" as a query parameter.
      - The final url user's wallet will call would be something similar to: ${this.configService.get('app.baseUrl')}/withdraw/callback?k1=${k1}&pr=lnbc...
      - This flow should be handled automatically by LNURL compatible wallets.
      - The server receives this request, and extracts the "pr" parameter in the handleWithdrawCallback method. 
   */
  async handleWithdrawCallback(k1: string, pr: string) {
    // "pr" is the bolt11 invoice generated by the wallet
    try {
      const paymentHash = await this.lnurlServer.lightning.payInvoice(pr);
      return { status: 'OK', paymentHash };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { status: 'ERROR', reason: 'Payment failed' };
    }
  }
}
