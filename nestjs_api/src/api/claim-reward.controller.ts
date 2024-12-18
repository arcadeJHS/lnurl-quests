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

@ApiTags('Claim')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('claim')
@UseGuards(ApiKeyGuard)
export class ClaimRewardController {
  constructor(private readonly service: ClaimService) {}

  /**
   * This method is defined here because generating a LNURL withdrawal link requires aggregating requests to services across multiple modules.
   */
  @Post('reward')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateLnurl(@Body() claimDto: ClaimDto) {
    // TODO: Do not call create, but the service to generate a LNURL-whitdraw link
    return await this.service.generateLnurl(claimDto);
  }
}
