import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { QuestDto } from './dto/quest.dto';
import { ValidateQuestDto } from './dto/validate-quest.dto';
import { QuestsService } from './quests.service';
import { ApiHeader } from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';

@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@Controller('quests')
@UseGuards(ApiKeyGuard)
export class QuestsController {
  constructor(private readonly service: QuestsService) {}

  @Get()
  async index() {
    return await this.service.findAll();
  }

  @Get(':id')
  async find(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() questDto: QuestDto) {
    return await this.service.create(questDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Param('id') id: string, @Body() questDto: QuestDto) {
    return await this.service.update(id, questDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }

  // @Post('validate')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async validate(@Body() validateQuestDto: ValidateQuestDto) {
  //   return await this.service.validateQuest(validateQuestDto);
  // }
}
