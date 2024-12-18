import { Injectable } from '@nestjs/common';
import { QuestsRepository } from './repositories/quests.repository';
import { Quest } from './schemas/quest.schema';
import { QuestDto } from './dto/quest.dto';
import { ValidateQuestDto } from './dto/validate-quest.dto';
import { validateConditions } from './conditions-validator';

@Injectable()
export class QuestsService {
  constructor(private repository: QuestsRepository) {}

  async create(questDto: QuestDto): Promise<Quest> {
    return await this.repository.create(questDto);
  }

  async findAll(): Promise<Quest[]> {
    return await this.repository.findAll();
  }

  async findOne(id: string): Promise<Quest | null> {
    return await this.repository.findOne(id);
  }

  async update(id: string, questDto: QuestDto): Promise<Quest> {
    return await this.repository.update(id, questDto);
  }

  async delete(id: string): Promise<Quest> {
    return await this.repository.delete(id);
  }

  async validateQuest(validateQuestDto: ValidateQuestDto): Promise<boolean> {
    const quest = await this.findOne(validateQuestDto.questId);
    const scenario = validateQuestDto.scenario;
    return validateConditions(scenario, quest.conditions);
  }
}
