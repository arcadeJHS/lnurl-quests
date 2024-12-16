import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateWithdrawDto,
  WithdrawCallbackDto,
  HandleWithdrawRequestDto,
} from '../dto/withdraw.dto';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AmountValidator } from '../validators/amount.validator';
import { K1Validator } from '../validators/k1.validator';
import { ApiHeader } from '@nestjs/swagger';
import { LightningBackend } from 'lnurl';

@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('api/withdraw')
@UseGuards(ApiKeyGuard, ThrottlerGuard)
export class WithdrawController {
  constructor(
    private readonly amountValidator: AmountValidator,
    private readonly k1Validator: K1Validator,
    @Inject('LightningService')
    private lightningService: LightningBackend,
  ) {}

  @Get('generateWithdrawUrl')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateWithdrawUrl(@Query() createWithdrawDto: CreateWithdrawDto) {
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

  @Get('handleWithdrawRequest')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWithdraw(
    @Query() handleWithdrawRequestDto: HandleWithdrawRequestDto,
  ) {
    this.k1Validator.validate(handleWithdrawRequestDto.q);

    const params = await this.lightningService.handleWithdrawRequest({
      q: handleWithdrawRequestDto.q,
    });

    return params;
  }

  @Get('handleWithdrawCallback')
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleCallback(@Query() callbackDto: WithdrawCallbackDto) {
    return this.lightningService.handleWithdrawCallback(
      callbackDto.k1,
      callbackDto.pr,
    );
  }
}
