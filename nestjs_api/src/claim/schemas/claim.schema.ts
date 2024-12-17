import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClaimStatus } from '../interfaces/claim-status.enum';
import { LnurlData, LnurlDataSchema } from './lnurl-data.schema';

@Schema({ timestamps: true })
export class Claim extends Document {
  @Prop({ required: true })
  questId: string;

  @Prop({
    required: true,
    enum: ClaimStatus,
    default: ClaimStatus.PENDING,
  })
  status: ClaimStatus;

  @Prop({ type: LnurlDataSchema })
  lnurlData?: LnurlData;

  @Prop()
  claimedAt?: Date;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
