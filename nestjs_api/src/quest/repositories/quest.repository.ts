import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quest } from '../schemas/quest.schema';

@Injectable()
export class QuestRepository {
  constructor(@InjectModel(Quest.name) private questModel: Model<Quest>) {}

  async create(questData: Partial<Quest>): Promise<Quest> {
    const quest = new this.questModel(questData);
    return quest.save();
  }
}
