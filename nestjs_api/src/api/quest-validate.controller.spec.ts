import { Test, TestingModule } from '@nestjs/testing';
import { QuestValidateController } from './quest-validate.controller';
import { QuestsService } from '../quests/quests.service';
import { ClaimService } from '../claim/claim.service';
import { ValidateQuestDto } from '@quests/dto/validate-quest.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClaimStatus } from '../claim/interfaces/claim-status.enum';
import { ConfigService } from '@nestjs/config';

describe('QuestValidateController', () => {
  let controller: QuestValidateController;
  let questsService: QuestsService;
  let claimService: ClaimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestValidateController],
      providers: [
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<QuestValidateController>(QuestValidateController);
    questsService = module.get<QuestsService>(QuestsService);
    claimService = module.get<ClaimService>(ClaimService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should validate a quest successfully', async () => {
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
      questId: '1',
      status: ClaimStatus.PENDING,
    };

    jest.spyOn(questsService, 'findOne').mockResolvedValue(quest);
    jest.spyOn(claimService, 'create').mockResolvedValue(claim);
    jest.spyOn(questsService, 'validateQuest').mockResolvedValue(true);
    jest.spyOn(claimService, 'update').mockResolvedValue(null);

    const result = await controller.validate(validateQuestDto);

    expect(result).toBe(true);
    expect(questsService.findOne).toHaveBeenCalledWith('1');
    expect(claimService.create).toHaveBeenCalledWith({
      questId: '1',
      status: ClaimStatus.PENDING,
    });
    expect(questsService.validateQuest).toHaveBeenCalledWith(validateQuestDto);
    expect(claimService.update).toHaveBeenCalledWith('1', {
      questId: '1',
      status: ClaimStatus.VALIDATED,
    });
  });

  it('should throw an error if the quest is not active', async () => {
    const validateQuestDto: ValidateQuestDto = { questId: '1', scenario: {} };
    const quest = {
      active: false,
      endDate: new Date(Date.now() + 10000),
      claimedRewards: 0,
      totalRewards: 10,
      title: 'Sample Quest',
      rewardAmount: 100,
      startDate: new Date(),
      conditions: {},
    };
    const q = jest.fn().mockImplementation(() => Promise.resolve(quest));
    jest.spyOn(questsService, 'findOne').mockImplementation(q);

    await expect(controller.validate(validateQuestDto)).rejects.toThrow(
      new HttpException('Quest is not active', HttpStatus.BAD_REQUEST),
    );
  });

  it('should throw an error if no rewards are left to claim', async () => {
    const validateQuestDto: ValidateQuestDto = { questId: '1', scenario: {} };
    const quest = {
      active: true,
      endDate: new Date(Date.now() + 10000),
      claimedRewards: 10,
      totalRewards: 10,
      title: 'Sample Quest',
      rewardAmount: 100,
      startDate: new Date(),
      conditions: {},
    };

    const q = jest.fn().mockImplementation(() => Promise.resolve(quest));
    jest.spyOn(questsService, 'findOne').mockImplementation(q);

    await expect(controller.validate(validateQuestDto)).rejects.toThrow(
      new HttpException('No rewards left to claim', HttpStatus.BAD_REQUEST),
    );
  });

  it('should update the claim status to rejected if the solution is invalid', async () => {
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
    const claim: any = {
      _id: '1',
      questId: '1',
      status: ClaimStatus.PENDING,
    };

    jest.spyOn(questsService, 'findOne').mockResolvedValue(quest);
    jest.spyOn(claimService, 'create').mockResolvedValue(claim);
    jest.spyOn(questsService, 'validateQuest').mockResolvedValue(false);
    jest.spyOn(claimService, 'update').mockResolvedValue(null);

    const result = await controller.validate(validateQuestDto);

    expect(result).toBe(false);
    expect(questsService.findOne).toHaveBeenCalledWith('1');
    expect(claimService.create).toHaveBeenCalledWith({
      questId: '1',
      status: ClaimStatus.PENDING,
    });
    expect(questsService.validateQuest).toHaveBeenCalledWith(validateQuestDto);
    expect(claimService.update).toHaveBeenCalledWith('1', {
      questId: '1',
      status: ClaimStatus.REJECTED,
    });
  });
});
