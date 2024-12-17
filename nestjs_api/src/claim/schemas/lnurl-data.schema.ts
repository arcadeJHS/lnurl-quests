import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class LnurlData {
  @Prop({ required: true })
  encoded: string;

  @Prop({ required: true })
  secret: string;

  @Prop({ required: true })
  url: string;
}

export const LnurlDataSchema = SchemaFactory.createForClass(LnurlData);
