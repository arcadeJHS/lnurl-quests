import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle } from '@nestjs/throttler';
import { CreateWithdrawDto } from '../lnurl/dto/withdraw.dto';
import { ClaimRewardService } from './claim-reward.service';
import { LNBitsGenerateWithdrawUrlResponse } from '../lnurl/interfaces/withdraw.interface';

/**
 * Methods defined here require cross-module access to different services.
 * Hence are implemented here, and not in the ClaimController directly.
 */
@ApiTags('Claim')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('claim')
@UseGuards(ApiKeyGuard)
export class ClaimRewardController {
  constructor(private readonly claimRewardService: ClaimRewardService) {}

  @Get('reward')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateWithdrawUrl(
    @Query() createWithdrawDto: CreateWithdrawDto,
  ): Promise<LNBitsGenerateWithdrawUrlResponse> {
    return await this.claimRewardService.generateWithdrawUrl(createWithdrawDto);
  }
}
