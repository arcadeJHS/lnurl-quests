/**
 *
 * NOTE: DEPRECATED (use lnbits-lightning.service.ts instead)
 * TODO: Remove this file
 *
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { WithdrawRepository } from '../repositories/withdraw.repository';
import { QRService } from './qr.service';
// import { BaseLightningService } from './base-lightning.service';
import { WithdrawResponse } from '../interfaces/withdraw.interface';
import { generateLnurl } from '../utils/lnurl.utils';
import { LightningBackend } from 'lnurl';

@Injectable()
export class WithdrawService {
  constructor(
    private withdrawRepository: WithdrawRepository,
    private configService: ConfigService,
    private qrService: QRService,
    @Inject('LightningService')
    private lightningService: LightningBackend,
  ) {}

  async generateWithdraw(
    minAmount: number,
    maxAmount: number,
    description: string,
  ): Promise<WithdrawResponse> {
    const k1 = crypto.randomBytes(32).toString('hex');
    const baseUrl = this.configService.get('app.baseUrl');

    const withdraw = await this.withdrawRepository.create({
      k1,
      minWithdrawable: minAmount,
      maxWithdrawable: maxAmount,
      defaultDescription: description || 'LNURL Withdrawal',
      used: false,
    });

    const lnurl = generateLnurl(baseUrl, withdraw);
    const qr = await this.qrService.generateQR(lnurl);

    return { lnurl, qr, k1 };
  }

  async handleCallback(k1: string, pr: string) {
    const withdraw = await this.withdrawRepository.findUnusedByK1(k1);

    if (!withdraw) {
      throw new Error('Invalid or already used withdrawal');
    }

    const payment = await this.lightningService.payInvoice(pr);
    await this.withdrawRepository.markAsUsed(
      withdraw._id,
      payment.payment_hash || '',
    );

    return { status: 'OK' };
  }
}
