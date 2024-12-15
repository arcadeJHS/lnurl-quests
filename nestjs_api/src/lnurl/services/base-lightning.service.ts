import { Injectable } from '@nestjs/common';
import { LightningPaymentResponse } from '../interfaces/withdraw.interface';

@Injectable()
export abstract class BaseLightningService {
  abstract makePayment(bolt11: string): Promise<LightningPaymentResponse>;
}