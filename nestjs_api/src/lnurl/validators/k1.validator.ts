import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { LnbitsLightningService } from '../services/lnbits-lightning.service';

@Injectable()
export class K1Validator {
  constructor(
    private readonly lnbitsLightningService: LnbitsLightningService,
  ) {}

  async validate(k1: string): Promise<boolean> {
    const k1IsValid = await this.lnbitsLightningService.isValidK1(k1);

    if (!k1IsValid) {
      throw new BadRequestException(`Invalid k1: ${k1}`);
    }

    return k1IsValid;
  }
}
