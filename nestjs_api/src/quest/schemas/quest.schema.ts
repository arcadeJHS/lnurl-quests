import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

@Schema({ timestamps: true })
export class Quest extends Document {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  rewardAmount: number;

  @Prop({ required: true })
  totalRewards: number;

  @Prop({ default: 0 })
  claimedRewards?: number;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: Object, required: true })
  conditions: Record<string, any>;
}

export const QuestSchema = SchemaFactory.createForClass(Quest);

const AutoIncrement = AutoIncrementFactory(mongoose);
QuestSchema.plugin(AutoIncrement, { inc_field: 'id' });

/**
 * Creating a new quest the id field will auto-increment:
 *
 * const newQuest = new this.questModel({
 *  ...
 * });
 *
 * await newQuest.save();
 *
 * console.log(newQuest.id);
 */
