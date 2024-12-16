import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WithdrawController } from './controllers/withdraw.controller';
import { WithdrawService } from './services/withdraw.service';
import { LnbitsLightningService } from './services/lnbits-lightning.service';
import { QRService } from './services/qr.service';
import { WithdrawRepository } from './repositories/withdraw.repository';
import { AmountValidator } from './validators/amount.validator';
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
    WithdrawService,
    {
      provide: 'LightningService',
      useClass: LnbitsLightningService,
    },
    QRService,
    WithdrawRepository,
    AmountValidator,
  ],
})
export class LnurlModule {}
