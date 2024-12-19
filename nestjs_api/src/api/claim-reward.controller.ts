import {
  Controller,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
  Inject,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle } from '@nestjs/throttler';
import { AmountValidator } from '../lnurl/validators/amount.validator';
import { CreateWithdrawDto } from '../lnurl/dto/withdraw.dto';
import { LightningBackend } from 'lnurl';

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
  constructor(
    private readonly amountValidator: AmountValidator,
    @Inject('LightningService')
    private lightningService: LightningBackend,
  ) {}

  @Get('reward')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateWithdrawUrl(@Query() createWithdrawDto: CreateWithdrawDto) {
    /**
     * 1. We have created a quest.
     * The quest contains the following fields:
     * - rewardAmount: we can use this to set the minWithdrawable and maxWithdrawable fields in the LNURL.
     * - title: we can use this to set the defaultDescription field in the LNURL, for instance `Claim your reward for completing the quest: ${title}`.
     *
     * 2. We have succesfully validated the scenario submitted by the user against the quest's conditions.
     */
    this.amountValidator.validate(
      createWithdrawDto.minAmount,
      createWithdrawDto.maxAmount,
    );

    /**
     * This method generates a withdraw URL similar to:
     * "http://localhost:3000/generateWithdrawParams?q=fde2c82bdc78ff7eda48de478a9412d785fa988cc1f16c8e89c0a82af138168b"
     *
     * Here, the "q" param is the "lnurl.secret" that will be used to uniquely identify the withdraw in subsequent operations.
     * TODO: add the withdraw request params to DB, using the param "lnurl.secret" as UUID to identify it in subsequent operations
     * TODO: params to add to DB: secret (as ID), minWithdrawable, maxWithdrawable, defaultDescription
     */
    const lnurl = await this.lightningService.generateWithdrawUrl({
      minWithdrawable: createWithdrawDto.minAmount,
      maxWithdrawable: createWithdrawDto.maxAmount,
      defaultDescription:
        createWithdrawDto.defaultDescription || 'LNURL Withdrawal test',
    });

    return lnurl;
  }
}
