import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WithdrawController } from './controllers/withdraw.controller';
import { LnbitsLightningService } from './services/lnbits-lightning.service';
import { QRService } from './services/qr.service';
import { WithdrawRepository } from './repositories/withdraw.repository';
import { AmountValidator } from './validators/amount.validator';
import { K1Validator } from './validators/k1.validator';
import { Withdraw, WithdrawSchema } from './schemas/withdraw.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Withdraw.name, schema: WithdrawSchema },
    ]),
  ],
  controllers: [WithdrawController],
  providers: [
    {
      provide: 'LightningService',
      useClass: LnbitsLightningService,
    },
    LnbitsLightningService,
    QRService,
    WithdrawRepository,
    AmountValidator,
    K1Validator,
  ],
})
export class LnurlModule {}
