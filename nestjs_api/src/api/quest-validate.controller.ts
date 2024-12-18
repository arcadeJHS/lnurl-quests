import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseFilters,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiTags,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { QuestsService } from '../quests/quests.service';
import { ValidateQuestDto } from '@quests/dto/validate-quest.dto';
import {
  HttpExceptionFilter,
  HttpExceptionResponse,
} from '../common/filters/http-exception.filter';
import { ClaimService } from '../claim/claim.service';
import { ClaimDto } from '../claim/dto/claim.dto';
import { ClaimStatus } from '../claim/interfaces/claim-status.enum';
import { Document } from 'mongoose';

enum QuestValidationError {
  QUEST_IS_NOT_ACTIVE = 'Quest is not active',
  QUEST_HAS_ENDED = 'Quest has ended',
  NO_REWARDS_LEFT = 'No rewards left to claim',
}

class ValidationHttpExceptionResponse implements HttpExceptionResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    enum: QuestValidationError,
    example: QuestValidationError.QUEST_IS_NOT_ACTIVE,
  })
  message: string;

  @ApiProperty({ example: '2024-12-18T10:32:28.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/quests/validate' })
  path: string;
}

/**
 * Methods defined here require cross-module access to different services.
 * Hence are implemented here, and not in the QuestsController directly.
 */
@ApiTags('Quests')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@UseFilters(HttpExceptionFilter)
@Controller('quests')
@UseGuards(ApiKeyGuard)
export class QuestValidateController {
  constructor(
    private readonly questService: QuestsService,
    private readonly claimService: ClaimService,
  ) {}

  @Post('validate')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiCreatedResponse({
    description: 'Quest validation successful',
    schema: { type: 'boolean', example: true },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ValidationHttpExceptionResponse,
  })
  async validate(@Body() validateQuestDto: ValidateQuestDto): Promise<boolean> {
    /**
     * 1. Get quest by questId.
     * 2. Verifiy:
     *    - active = true
     *    - endDate > now()
     *    - claimedRewards < totalRewards
     * 3. Validate the quest scenario.
     * 4. Return true if the scenario is correct, false otherwise.
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
    const claim = (await this.claimService.create({
      questId: questId,
      status: ClaimStatus.PENDING,
    })) as Document & ClaimDto;

    // Validate the quest scenario
    const solutionIsValid =
      await this.questService.validateQuest(validateQuestDto);

    // Update the claim status based on the validation result
    await this.claimService.update(claim._id, {
      questId: questId,
      status: solutionIsValid ? ClaimStatus.VALIDATED : ClaimStatus.REJECTED,
    });

    return solutionIsValid;
  }
}
