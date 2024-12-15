import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AmountValidator {
  constructor(private configService: ConfigService) {}

  validate(minAmount: number, maxAmount: number): void {
    const max = this.configService.get<number>('lightning.maxWithdrawAmount');
    const min = this.configService.get<number>('lightning.minWithdrawAmount');

    if (maxAmount > (max || 0)) {
      throw new BadRequestException(
        `Amount exceeds maximum limit of ${maxAmount}`,
      );
    }

    if (minAmount < (min || 0)) {
      throw new BadRequestException(
        `Amount below minimum limit of ${minAmount}`,
      );
    }
  }
}
