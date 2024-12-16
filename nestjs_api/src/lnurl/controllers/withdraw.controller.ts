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
  async createLnurlLink() {
    // TODO: add input params to identify the generated link (which maybe will be used to generate the hash/UUID)
    // TODO: add to DB with params like UUID or hash to identify (in the future, on DB) the generated link
    const lnurl = await this.lightningService.generateWithdrawUrl({
      minWithdrawable: 100,
      maxWithdrawable: 200,
      defaultDescription: 'LNURL Withdrawal test',
    });
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
