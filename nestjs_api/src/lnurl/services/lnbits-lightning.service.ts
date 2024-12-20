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
import {
  LNBitsLnurlData,
  WithdrawParamsResponse,
  GenerateWithdraw,
} from '../interfaces/withdraw.interface';
import { WithdrawRepository } from '../repositories/withdraw.repository';

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
      return response.data;
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
      host: this.configService.get('app.host'),
      port: this.configService.get('app.port'),
      listen: false,
      endpoint: `/${this.configService.get('lightning.withdrawParamsUrl')}`,
      lightning: new LNBitsBackend({
        apiKey: this.configService.get('lightning.apiKey'),
        url: this.configService.get('lightning.lnbitsUrl'),
      }),
    });
  }

  async isValidK1(k1: string): Promise<boolean> {
    return await !!this.withdrawRepository.findUnusedByK1(k1);
  }

  // 1) Generate withdraw url
  /**
   * This method generates a withdraw URL similar to (see the configuration.ts file: lightning.withdrawParamsUrl):
   * "http://localhost:3000/api/lnurl/handleWithdrawRequest?q=fde2c82bdc78ff7eda48de478a9412d785fa988cc1f16c8e89c0a82af138168b"
   *
   * Here, the "q" param is the "secret" that will be used to uniquely identify the withdraw in subsequent operations.
   * After generating lnurlData, we create and save the withdraw in the DB with the following params:
   *  {
        k1, // aka "secret"
        minWithdrawable: minAmount,
        maxWithdrawable: maxAmount,
        defaultDescription: description || 'LNURL Withdrawal'
      }
   */
  async generateWithdrawUrl({
    minWithdrawable,
    maxWithdrawable,
    defaultDescription,
  }: GenerateWithdraw): Promise<LNBitsLnurlData> {
    // TODO: add exceptions handling
    // TODO: check validity of request, check funds (is it better to check in this initial phase or later?)...
    // TODO: maybe generate a QR code somewhere (not here)? Anyway this is a more UI related concern.
    // import { QRService } from './qr.service';
    // const qr = await this.qrService.generateQR(request.url);
    const description = defaultDescription || 'LNURL Withdrawal';
    const params = {
      maxWithdrawable,
      minWithdrawable,
      defaultDescription: description,
    };

    const lnurlData = await this.lnurlServer.generateNewUrl(
      'withdrawRequest',
      params,
    );

    // Create a new withdraw in the DB
    await this.withdrawRepository.create({
      k1: lnurlData.secret, // aka "secret"
      ...params,
    });

    return lnurlData;
  }

  // 2) The user's wallet follow the url generated in step 1, and calls this method to get withdraw params
  async handleWithdrawRequest({
    q,
  }: {
    q: string;
  }): Promise<WithdrawParamsResponse> {
    // TODO: add exceptions handling
    // This method is called with a "q" query param, which is the "secret" param generated in the previous "this.lnurlServer.generateWithdrawUrl" step.
    // We use this "secret" to fetch the withdraw from the DB, and to set "k1" in the withdraw response.
    const withdraw = await this.withdrawRepository.findUnusedByK1(q);

    const withdrawParams: WithdrawParamsResponse = {
      tag: 'withdrawRequest',
      k1: q,
      // Note: when the wallet calls this callback url
      // it will automatically append also the "pr" param as a query param. So "pr" will be available in the callback method "handleWithdrawCallback".
      // TODO: verify the flow really works like this (are we getting the "pr" param when the wallet calls the callback?)
      callback: `${this.configService.get('app.baseUrl')}/${this.configService.get('lightning.withdrawCallbackUrl')}?k1=${q}`,
      maxWithdrawable: withdraw.maxWithdrawable,
      minWithdrawable: withdraw.minWithdrawable,
      defaultDescription: withdraw.defaultDescription,
    };

    return withdrawParams;
  }

  // 3) Callback handling
  /**
   * As noted in the previous step (handleWithdrawRequest):
   * when the wallet calls the callback url, it will automatically append also the "pr" param as a query param (it should, at least!).
   
    The flow for obtaining the "pr" parameter is quite complex and, in some way, counterintuitive:
      - The server generates a withdraw URL using server.generateNewUrl('withdrawRequest').
      - The user's wallet accesses this URL and receives a JSON response (by the handleWithdrawRequest method) containing withdrawal parameters.
      - The wallet should now generate a bolt11 invoice, and send a GET request to the callback URL, including the "pr" as a query parameter.
      - The final url user's wallet will call would be something similar to: ${this.configService.get('app.baseUrl')}/api/lnurl/handleWithdrawCallback?k1=${k1}&pr=lnbc...
      - This flow should be handled automatically by LNURL compatible wallets.
      - The server receives this request, and extracts the "pr" parameter in the handleWithdrawCallback method. 
   */
  async handleWithdrawCallback(k1: string, pr: string) {
    // Check if the withdraw is (still) valid
    const withdraw = await this.withdrawRepository.findUnusedByK1(k1);

    // "pr" is the bolt11 invoice generated by the wallet
    try {
      const paymentHash = await this.lnurlServer.lightning.payInvoice(pr);

      // If everything OK, on the DB update the withdraw as used and paid
      await this.withdrawRepository.markAsUsed(withdraw._id, paymentHash);

      return { status: 'OK', paymentHash };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { status: 'ERROR', reason: 'Payment failed' };
    }
  }
}
