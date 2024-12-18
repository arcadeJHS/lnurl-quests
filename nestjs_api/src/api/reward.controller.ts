import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { ClaimService } from '../claim/claim.service';
import { ClaimDto } from '../claim/dto/claim.dto';

/**
 * Methods defined here require cross-module access to different services.
 */
@ApiTags('Claim')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('claim')
@UseGuards(ApiKeyGuard)
export class RewardController {
  constructor(private readonly service: ClaimService) {}

  @Post('reward')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateLnurl(@Body() claimDto: ClaimDto) {
    /**
     * 1. We have created a quest.
     * The quest contains the following fields:
     * - rewardAmount: we can use this to set the minWithdrawable and maxWithdrawable fields in the LNURL.
     * - title: we can use this to set the defaultDescription field in the LNURL, for instance `Claim your reward for completing the quest: ${title}`.
     *
     * 2. We have succesfully validated the scenario submitted by the user against the quest's conditions.
     */
    // TODO: Do not call create, but the service to generate a LNURL-whitdraw link
    return await this.service.generateLnurl(claimDto);
  }
}
