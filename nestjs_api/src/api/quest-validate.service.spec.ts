import { Test, TestingModule } from '@nestjs/testing';
import { QuestValidationService } from './quest-validate.service';
import { QuestsService } from '../quests/quests.service';
import { ClaimService } from '../claim/claim.service';
import { ValidateQuestDto } from '@quests/dto/validate-quest.dto';
import { HttpException } from '@nestjs/common';
import { ClaimStatus } from '../claim/interfaces/claim-status.enum';
import { QuestValidationError } from './interfaces/quest-validation-error.enum';

describe('QuestValidationService', () => {
  let service: QuestValidationService;
  let questsService: QuestsService;
  let claimService: ClaimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestValidationService,
        {
          provide: QuestsService,
          useValue: {
            findOne: jest.fn(),
            validateQuest: jest.fn(),
          },
        },
        {
          provide: ClaimService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QuestValidationService>(QuestValidationService);
    questsService = module.get<QuestsService>(QuestsService);
    claimService = module.get<ClaimService>(ClaimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if the quest is not active', async () => {
    const validateQuestDto: ValidateQuestDto = { questId: '1', scenario: {} };
    questsService.findOne = jest.fn().mockResolvedValue({ active: false });

    await expect(service.validateQuest(validateQuestDto)).rejects.toThrow(
      new HttpException(QuestValidationError.QUEST_IS_NOT_ACTIVE, 400),
    );
  });

  it('should throw an error if the quest has ended', async () => {
    const validateQuestDto: ValidateQuestDto = { questId: '1', scenario: {} };
    questsService.findOne = jest.fn().mockResolvedValue({
      active: true,
      endDate: new Date(Date.now() - 1000),
    });

    await expect(service.validateQuest(validateQuestDto)).rejects.toThrow(
      new HttpException(QuestValidationError.QUEST_HAS_ENDED, 400),
    );
  });

  it('should throw an error if there are no rewards left', async () => {
    const validateQuestDto: ValidateQuestDto = { questId: '1', scenario: {} };
    questsService.findOne = jest.fn().mockResolvedValue({
      active: true,
      endDate: new Date(Date.now() + 1000),
      claimedRewards: 10,
      totalRewards: 10,
    });

    await expect(service.validateQuest(validateQuestDto)).rejects.toThrow(
      new HttpException(QuestValidationError.NO_REWARDS_LEFT, 400),
    );
  });

  it('should create a claim and validate the quest', async () => {
    const validateQuestDto: ValidateQuestDto = {
      questId: '1',
      scenario: {
        wordsToGuess: ['quantum', 'blockchain', 'algorithm'],
      },
    };

    const quest: any = {
      active: true,
      endDate: new Date(Date.now() + 10000),
      claimedRewards: 0,
      totalRewards: 10,
      title: 'Sample Quest',
      rewardAmount: 100,
      startDate: new Date(),
      conditions: {
        wordsToGuess: {
          words: [
            'quantum',
            'relativity',
            'neuroscience',
            'blockchain',
            'algorithm',
          ],
          min: 3,
        },
      },
    };

    const claim: any = {
      _id: '1',
      status: ClaimStatus.PENDING,
    };

    questsService.findOne = jest.fn().mockResolvedValue(quest);
    claimService.create = jest.fn().mockResolvedValue(claim);
    questsService.validateQuest = jest.fn().mockResolvedValue(true);
    claimService.update = jest.fn().mockResolvedValue({
      ...claim,
      status: ClaimStatus.VALIDATED,
    });

    const result = await service.validateQuest(validateQuestDto);
    expect(result).toBe(claim._id);
  });

  it('should reject the claim if the solution is invalid', async () => {
    const validateQuestDto: ValidateQuestDto = {
      questId: '1',
      scenario: {
        wordsToGuess: ['altcoin', 'hype'],
      },
    };

    const quest: any = {
      active: true,
      endDate: new Date(Date.now() + 10000),
      claimedRewards: 0,
      totalRewards: 10,
      title: 'Sample Quest',
      rewardAmount: 100,
      startDate: new Date(),
      conditions: {
        wordsToGuess: {
          words: [
            'quantum',
            'relativity',
            'neuroscience',
            'blockchain',
            'algorithm',
          ],
          min: 3,
        },
      },
    };

    const claim = {
      _id: 'claimId',
      status: ClaimStatus.PENDING,
    };

    questsService.findOne = jest.fn().mockResolvedValue(quest);
    claimService.create = jest.fn().mockResolvedValue(claim);
    questsService.validateQuest = jest.fn().mockResolvedValue(false);
    claimService.update = jest.fn().mockResolvedValue({
      ...claim,
      status: ClaimStatus.REJECTED,
    });

    await expect(service.validateQuest(validateQuestDto)).rejects.toThrow(
      new HttpException(QuestValidationError.INVALID_SOLUTION, 400),
    );
  });
});
