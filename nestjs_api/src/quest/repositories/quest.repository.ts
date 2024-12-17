import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quest } from '../schemas/quest.schema';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

@Injectable()
export class QuestRepository {
  constructor(@InjectModel(Quest.name) private questModel: Model<Quest>) {}

  async create(createQuestDto: CreateQuestDto): Promise<Quest> {
    const quest = new this.questModel(createQuestDto);
    return quest.save();
  }

  async findAll(): Promise<Quest[]> {
    return await this.questModel.find().exec();
  }

  async findOne(id: string): Promise<Quest | null> {
    return await this.questModel.findById(id).exec();
  }

  async update(id: string, updateQuestDto: UpdateQuestDto): Promise<Quest> {
    return await this.questModel.findByIdAndUpdate(id, updateQuestDto).exec();
  }

  async delete(id: string): Promise<Quest> {
    return await this.questModel.findByIdAndDelete(id).exec();
  }
}
