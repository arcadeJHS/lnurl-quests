import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LightningPaymentResponse } from '../interfaces/withdraw.interface';

@Injectable()
export class LightningService {
  constructor(private configService: ConfigService) {}

  async makePayment(bolt11: string): Promise<LightningPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.configService.get('lightning.lnbitsUrl')}/api/v1/payments`,
        { out: true, bolt11 },
        { 
          headers: { 
            'X-Api-Key': this.configService.get('lightning.apiKey')
          }
        }
      );
      
      return {
        status: 'OK',
        payment_hash: response.data.payment_hash,
      };
    } catch (error) {
      throw new Error('Lightning payment failed');
    }
  }
}