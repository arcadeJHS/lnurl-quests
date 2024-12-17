import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quest } from '../schemas/quest.schema';
import { QuestDto } from '../dto/quest.dto';

@Injectable()
export class QuestsRepository {
  constructor(@InjectModel(Quest.name) private questModel: Model<Quest>) {}

  async create(questDto: QuestDto): Promise<Quest> {
    const quest = new this.questModel(questDto);
    return quest.save();
  }

  async findAll(): Promise<Quest[]> {
    return await this.questModel.find().exec();
  }

  async findOne(id: string): Promise<Quest | null> {
    return await this.questModel.findById(id).exec();
  }

  async update(id: string, questDto: QuestDto): Promise<Quest> {
    return await this.questModel.findByIdAndUpdate(id, questDto).exec();
  }

  async delete(id: string): Promise<Quest> {
    return await this.questModel.findByIdAndDelete(id).exec();
  }
}
