import { Injectable } from '@nestjs/common';
import { QuestRepository } from './repositories/quest.repository';
import { Quest } from './schemas/quest.schema';
import { CreateQuestDto } from './dto/create-quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Injectable()
export class QuestService {
  constructor(private questRepository: QuestRepository) {}

  async create(createQuestDto: CreateQuestDto): Promise<Quest> {
    return await this.questRepository.create(createQuestDto);
  }

  async findAll(): Promise<Quest[]> {
    return await this.questRepository.findAll();
  }

  async findOne(id: string): Promise<Quest | null> {
    return await this.questRepository.findOne(id);
  }

  async update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest> {
    return await this.questRepository.update(id, updateQuestDto);
  }

  async delete(id: string): Promise<Quest> {
    return await this.questRepository.delete(id);
  }
}
