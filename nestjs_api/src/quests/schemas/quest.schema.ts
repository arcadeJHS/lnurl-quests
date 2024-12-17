import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // automatically handle "createdAt" field
export class Quest extends Document {
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
