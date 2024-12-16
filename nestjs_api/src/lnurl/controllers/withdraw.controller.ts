import {
  Controller,
  Get,
  Inject,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WithdrawService } from '../services/withdraw.service';
import { CreateWithdrawDto, WithdrawCallbackDto } from '../dto/withdraw.dto';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AmountValidator } from '../validators/amount.validator';
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
    private readonly withdrawService: WithdrawService,
    private readonly amountValidator: AmountValidator,
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

    const lnurl = await this.lightningService.generateWithdrawUrl({
      minWithdrawable: createWithdrawDto.minAmount,
      maxWithdrawable: createWithdrawDto.maxAmount,
      defaultDescription:
        createWithdrawDto.defaultDescription || 'LNURL Withdrawal test',
    });

    // TODO: add the generated withdraw to DB, using the param "lnurl.secret" as UUID to identify it in subsequent operations

    return lnurl;
  }

  @Get('generateWithdrawParams')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWithdraw(@Query() createWithdrawDto: CreateWithdrawDto) {
    this.amountValidator.validate(
      createWithdrawDto.minAmount,
      createWithdrawDto.maxAmount,
    );

    return this.withdrawService.generateWithdraw(
      createWithdrawDto.minAmount,
      createWithdrawDto.maxAmount,
      createWithdrawDto.defaultDescription,
    );
  }

  @Get('withdraw/callback')
  @Throttle({ default: { limit: 20, ttl: 60 } })
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleCallback(@Query() callbackDto: WithdrawCallbackDto) {
    return this.withdrawService.handleCallback(callbackDto.k1, callbackDto.pr);
  }
}
