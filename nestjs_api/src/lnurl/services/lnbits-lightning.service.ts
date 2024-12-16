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
import { WithdrawRepository } from '@lnurl/repositories/withdraw.repository';

export class LNBitsBackend extends LightningBackend {
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

  isValidK1(k1: string): Promise<boolean> {
    console.log(k1);
    return Promise.reject('Not implemented');
  }
}

@Injectable()
export class LnbitsLightningService implements OnModuleInit {
  constructor(
    private configService: ConfigService,
    private withdrawRepository: WithdrawRepository,
  ) {}

  private lnurlServer: any;

  async onModuleInit() {
    this.lnurlServer = lnurl.createServer({
      // TODO: define host and port from in .env
      host: 'localhost',
      port: 3000,
      endpoint: '/handleWithdrawRequest',
      listen: false,
      lightning: new LNBitsBackend({
        apiKey: this.configService.get('lightning.apiKey'),
        url: this.configService.get('lightning.lnbitsUrl'),
      }),
    });
  }

  // TODO: add DB management for the following methods

  // 1) Generate withdraw url
  /**
   * This method generates a withdraw URL similar to:
   * "http://localhost:3000/generateWithdrawParams?q=fde2c82bdc78ff7eda48de478a9412d785fa988cc1f16c8e89c0a82af138168b"
   *
   * Here, the "q" param is the "lnurl.secret" that will be used to uniquely identify the withdraw in subsequent operations.
   * TODO: add the withdraw request params to DB, using the param "lnurl.secret" as UUID to identify it in subsequent operations
   * TODO: params to add to DB: secret (as ID), minWithdrawable, maxWithdrawable, defaultDescription
   * 
   * For instance (to save in DB):
      const withdraw = await this.withdrawRepository.create({
        k1,
        minWithdrawable: minAmount,
        maxWithdrawable: maxAmount,
        defaultDescription: description || 'LNURL Withdrawal',
        used: false,
      });
   */
  async generateWithdrawUrl(params: {
    minWithdrawable: number;
    maxWithdrawable: number;
    defaultDescription: string;
  }): Promise<LNBitsGenerateWithdrawUrlResponse> {
    // TODO: check validity of request, check funds...

    // TODO: maybe generate a QR code somewhere (not here)?
    // import { QRService } from './qr.service';
    // const qr = await this.qrService.generateQR(request.url);
    const request = this.lnurlServer.generateNewUrl('withdrawRequest', params);
    return request;
  }

  // 2) The user's wallet follow the url generate at step 1 and calls this method to get withdraw params
  async handleWithdrawRequest(params) {
    // Note: k1 is the "secret" param generated in the previous "this.lnurlServer.generateWithdrawUrl" step.
    const { q } = params;
    const k1 = q;

    // TODO: the other required params, minWithdrawable, maxWithdrawable, defaultDescription, should be fetched from the DB using the "k1" param.
    const { minWithdrawable, maxWithdrawable, defaultDescription } = {
      minWithdrawable: 1000,
      maxWithdrawable: 100000,
      defaultDescription: 'LNURL Withdrawal',
    }; // mocked values. Get them from DB.

    return {
      tag: 'withdrawRequest',
      // Note: when the wallet calls this callback url
      // it will automatically append also the "pr" param as a query param.
      // TODO: verify this is really the case (are we getting the "pr" param when the wallet calls the callback?)
      callback: `${this.configService.get('app.baseUrl')}/api/withdraw/handleWithdrawCallback?k1=${k1}`,
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
      - The final url user's wallet will call would be something similar to: ${this.configService.get('app.baseUrl')}/api/withdraw/handleWithdrawCallback?k1=${k1}&pr=lnbc...
      - This flow should be handled automatically by LNURL compatible wallets.
      - The server receives this request, and extracts the "pr" parameter in the handleWithdrawCallback method. 
   */
  async handleWithdrawCallback(k1: string, pr: string) {
    // TODO: check DB for validity
    // For instance:
    // const withdraw = await this.withdrawRepository.findUnusedByK1(k1);
    // if (!withdraw) {
    //   throw new Error('Invalid or already used withdrawal');
    // }

    // "pr" is the bolt11 invoice generated by the wallet
    try {
      const paymentHash = await this.lnurlServer.lightning.payInvoice(pr);

      // TODO: if everything OK, update the DB:
      // await this.withdrawRepository.markAsUsed(
      //   withdraw._id,
      //   payment.payment_hash || '',
      // );

      return { status: 'OK', paymentHash };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { status: 'ERROR', reason: 'Payment failed' };
    }
  }

  async isValidK1(k1: string): Promise<boolean> {
    return await !!this.withdrawRepository.findUnusedByK1(k1);
  }
}
