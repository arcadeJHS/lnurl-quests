import { Injectable } from '@nestjs/common';
import { QuestsRepository } from './repositories/quests.repository';
import { Quest } from './schemas/quest.schema';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { ValidateQuestDto } from './dto/validate-quest.dto';

@Injectable()
export class QuestsService {
  constructor(private repository: QuestsRepository) {}

  async create(createQuestDto: CreateQuestDto): Promise<Quest> {
    return await this.repository.create(createQuestDto);
  }

  async findAll(): Promise<Quest[]> {
    return await this.repository.findAll();
  }

  async findOne(id: string): Promise<Quest | null> {
    return await this.repository.findOne(id);
  }

  async update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest> {
    return await this.repository.update(id, updateQuestDto);
  }

  async delete(id: string): Promise<Quest> {
    return await this.repository.delete(id);
  }

  async validateQuest(validateQuestDto: ValidateQuestDto): Promise<boolean> {
    // TODO: implement me!
    console.log(validateQuestDto);
    return await true;

    // const quest = await this.repository.findOne(id);
    // return quest.answer === answer;
  }
}
