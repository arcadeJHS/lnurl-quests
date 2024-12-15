import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Withdraw extends Document {
  @Prop({ required: true })
  k1: string;

  @Prop({ required: true })
  maxWithdrawable: number;

  @Prop({ required: true })
  defaultDescription: string;

  @Prop({ required: true })
  minWithdrawable: number;

  @Prop({ default: false })
  used: boolean;

  @Prop()
  usedAt?: Date;

  @Prop()
  paymentHash?: string;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
