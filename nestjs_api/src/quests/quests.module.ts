import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { QuestValidatorService } from './quest-validator.service';
import { QuestsController } from './quests.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Quest, QuestSchema } from './schemas/quest.schema';
import { QuestsRepository } from './repositories/quests.repository';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Quest.name, schema: QuestSchema }]),
  ],
  providers: [QuestsService, QuestValidatorService, QuestsRepository],
  controllers: [QuestsController],
})
export class QuestModule {}
