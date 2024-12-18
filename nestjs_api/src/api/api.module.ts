import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestModule } from '../quests/quests.module';
import { QuestsController } from '../quests/quests.controller';
import { ClaimModule } from '../claim/claim.module';
import { ClaimController } from '../claim/claim.controller';
import { LnurlModule } from '../lnurl/lnurl.module';
import { LnurlController } from '../lnurl/controllers/lnurl.controller';
import { LnbitsLightningService } from '../lnurl/services/lnbits-lightning.service';
import { QuestValidateController } from './quest-validate.controller';
import { ClaimRewardController } from './claim-reward.controller';
import { QuestValidationService } from './quest-validate.service';
import { ClaimRewardService } from './claim-reward.service';

@Module({
  imports: [ConfigModule, LnurlModule, QuestModule, ClaimModule],
  controllers: [
    QuestsController,
    ClaimRewardController,
    ClaimController,
    LnurlController,
    QuestValidateController,
  ],
  providers: [
    {
      provide: 'LightningService',
      useClass: LnbitsLightningService,
    },
    QuestValidationService,
    ClaimRewardService,
  ],
})
export class ApiModule {}
