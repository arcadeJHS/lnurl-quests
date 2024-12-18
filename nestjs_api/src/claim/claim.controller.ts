import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { ClaimService } from './claim.service';
import { ClaimDto } from './dto/claim.dto';

@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('claim')
@UseGuards(ApiKeyGuard)
export class ClaimController {
  constructor(private readonly service: ClaimService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() claimDto: ClaimDto) {
    return await this.service.create(claimDto);
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() claimDto: ClaimDto) {
    return await this.service.update(id, claimDto);
  }

  // @Post('reward')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async generateLnurl(@Body() claimDto: ClaimDto) {
  //   // TODO: Do not call create, but the service to generate a LNURL-whitdraw link
  //   return await this.service.generateLnurl(claimDto);
  // }
}
