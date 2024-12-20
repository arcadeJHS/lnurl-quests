import {
  Query,
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
// import { AmountValidator } from '../lnurl/validators/amount.validator';
import { CreateWithdrawDto } from '../lnurl/dto/withdraw.dto';
import { LnbitsLightningService } from '../lnurl/services/lnbits-lightning.service';
import { LNBitsGenerateWithdrawUrlResponse } from '../lnurl/interfaces/withdraw.interface';
import { ClaimService } from '../claim/claim.service';
import { QuestsService } from '../quests/quests.service';
import { ClaimRewardError } from './interfaces/claim-reward-error.enum';

@Injectable()
export class ClaimRewardService {
  constructor(
    // private readonly amountValidator: AmountValidator,
    @Inject('LightningService')
    private readonly lightningService: LnbitsLightningService,
    private readonly claimService: ClaimService,
    private readonly questService: QuestsService,
  ) {}

  async generateWithdrawUrl(
    @Query() createWithdrawDto: CreateWithdrawDto,
  ): Promise<LNBitsGenerateWithdrawUrlResponse> {
    // TODO: move this validation to the quest creation logic
    // this.amountValidator.validate(
    //   createWithdrawDto.minAmount,
    //   createWithdrawDto.maxAmount,
    // );s

    /**
     * 1. createWithdrawDto.token is the claimId generated by validating a solution against a quest.
     * 2. With that token we can get the claim document from the DB.
     * 3. A claim contains a questId, which we can use to get the quest document from the DB.
     * 4. The quest contains the following fields:
     * - rewardAmount: we can use this to set the minWithdrawable and maxWithdrawable fields in the LNURL.
     * - title: we can use this to set the defaultDescription field in the LNURL, for instance `Claim your reward for completing the quest: ${title}`.
     */
    try {
      const claimId = createWithdrawDto.token;

      if (!claimId) {
        throw new HttpException(
          ClaimRewardError.INVALID_TOKEN,
          HttpStatus.BAD_REQUEST,
        );
      }

      // get claim document by claimId
      const claim = await this.claimService.findOne(claimId);

      if (!claim) {
        throw new HttpException(
          ClaimRewardError.INVALID_CLAIM,
          HttpStatus.BAD_REQUEST,
        );
      }

      // get quest document by claim.questId
      const quest = await this.questService.findOne(claim.questId);

      if (!quest) {
        throw new HttpException(
          ClaimRewardError.INVALID_QUEST,
          HttpStatus.BAD_REQUEST,
        );
      }

      const lnurl = await this.lightningService.generateWithdrawUrl({
        minWithdrawable: quest.rewardAmount,
        maxWithdrawable: quest.rewardAmount,
        defaultDescription: `Reward for ${quest.title}`,
      });

      return lnurl;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
