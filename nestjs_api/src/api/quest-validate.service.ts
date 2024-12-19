import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QuestsService } from '../quests/quests.service';
import { ValidateQuestDto } from '@quests/dto/validate-quest.dto';
import { ClaimService } from '../claim/claim.service';
import { ClaimDocument } from '../claim/dto/claim.dto';
import { ClaimStatus } from '../claim/interfaces/claim-status.enum';
import { QuestValidationError } from './interfaces/quest-validation-error.enum';

@Injectable()
export class QuestValidationService {
  constructor(
    private readonly questService: QuestsService,
    private readonly claimService: ClaimService,
  ) {}

  async validateQuest(validateQuestDto: ValidateQuestDto): Promise<string> {
    /**
     * 1. Get quest by questId.
     * 2. Verifiy:
     *    - active = true
     *    - endDate > now()
     *    - claimedRewards < totalRewards
     * 3. Validate the quest scenario.
     * 4. If the solution satisifes the requirements, return the generated claim id, to be used as a token in a subsequent /api/claim/reward call.
     */
    const questId = validateQuestDto.questId;
    const quest = await this.questService.findOne(questId);

    // Verify the quest is active, has not ended, and has rewards left to claim
    if (!quest.active) {
      throw new HttpException(
        QuestValidationError.QUEST_IS_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (new Date(quest.endDate) <= new Date()) {
      throw new HttpException(
        QuestValidationError.QUEST_HAS_ENDED,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (quest.claimedRewards >= quest.totalRewards) {
      throw new HttpException(
        QuestValidationError.NO_REWARDS_LEFT,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create a new claim for the quest
    let claim = (await this.claimService.create({
      questId: questId,
      status: ClaimStatus.PENDING,
    })) as ClaimDocument;

    // Validate the quest scenario
    const solutionIsValid =
      await this.questService.validateQuest(validateQuestDto);

    // Update the claim status based on the validation result
    claim = await this.claimService.update(claim._id, {
      questId: questId,
      status: solutionIsValid ? ClaimStatus.VALIDATED : ClaimStatus.REJECTED,
    });

    if (claim.status === ClaimStatus.REJECTED) {
      throw new HttpException(
        QuestValidationError.INVALID_SOLUTION,
        HttpStatus.BAD_REQUEST,
      );
    }

    // The token to be used in /api/claim/reward
    return claim._id;
  }
}
