import { Injectable } from '@nestjs/common';
import { QuestRepository } from './repositories/quest.repository';

@Injectable()
export class QuestService {
  constructor(private questRepository: QuestRepository) {}
}
