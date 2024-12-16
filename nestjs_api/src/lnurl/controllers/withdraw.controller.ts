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
import { LNURLService } from '../services/lnurl.service';
import { CreateWithdrawDto, WithdrawCallbackDto } from '../dto/withdraw.dto';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AmountValidator } from '../validators/amount.validator';
import { ApiHeader } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { LightningBackend } from 'lnurl';

@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('api/withdraw')
@UseGuards(ApiKeyGuard, ThrottlerGuard)
export class WithdrawController {
  constructor(
    private readonly lnurlService: LNURLService,
    private readonly withdrawService: WithdrawService,
    private readonly amountValidator: AmountValidator,
    private readonly configService: ConfigService,
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

    // const baseUrl = this.configService.get('app.baseUrl');
    // const lnurl = this.lnurlService.generateLnurlLink(
    //   `${baseUrl}/api/withdraw/generateWithdrawParams`,
    //   '1234abc4bebebebeb',
    // );
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
