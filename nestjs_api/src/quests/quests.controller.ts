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
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
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
  async create(@Body() createQuestDto: CreateQuestDto) {
    return await this.service.create(createQuestDto);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateQuestDto: UpdateQuestDto,
  ) {
    return await this.service.update(id, updateQuestDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }

  @Post('validate')
  @UsePipes(new ValidationPipe({ transform: true }))
  async validate(@Body() validateQuestDto: ValidateQuestDto) {
    return await this.service.validateQuest(validateQuestDto);
  }
}
