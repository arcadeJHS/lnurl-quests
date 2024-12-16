import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Quest, QuestSchema } from './schemas/quest.schema';
import { QuestRepository } from './repositories/quest.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Quest.name, schema: QuestSchema }]),
  ],
  providers: [QuestService, QuestRepository],
  controllers: [QuestController],
})
export class QuestModule {}
