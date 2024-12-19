import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  UseFilters,
} from '@nestjs/common';
import { ApiHeader, ApiTags, ApiBadRequestResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle } from '@nestjs/throttler';
import { CreateWithdrawDto } from '../lnurl/dto/withdraw.dto';
import { ClaimRewardService } from './claim-reward.service';
import { LNBitsGenerateWithdrawUrlResponse } from '../lnurl/interfaces/withdraw.interface';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { ClaimRewardError } from './interfaces/claim-reward-error.enum';
import { ValidationHttpExceptionResponse } from '../common/filters/validation-http-exception-response';

/**
 * Methods defined here require cross-module access to different services.
 * Hence are implemented here, and not in the ClaimController directly.
 */
@ApiTags('Claim')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@UseFilters(HttpExceptionFilter)
@Controller('claim')
@UseGuards(ApiKeyGuard)
export class ClaimRewardController {
  constructor(private readonly claimRewardService: ClaimRewardService) {}

  @Get('reward')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ValidationHttpExceptionResponse<ClaimRewardError>,
  })
  async generateWithdrawUrl(
    @Query() createWithdrawDto: CreateWithdrawDto,
  ): Promise<LNBitsGenerateWithdrawUrlResponse> {
    return await this.claimRewardService.generateWithdrawUrl(createWithdrawDto);
  }
}
