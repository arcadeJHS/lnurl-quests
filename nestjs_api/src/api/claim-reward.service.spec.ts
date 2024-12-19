import { Test, TestingModule } from '@nestjs/testing';
import { ClaimRewardService } from './claim-reward.service';
import { ClaimService } from '../claim/claim.service';
import { QuestsService } from '../quests/quests.service';
import { LnbitsLightningService } from '../lnurl/services/lnbits-lightning.service';
import { HttpException } from '@nestjs/common';
import { ClaimRewardError } from './interfaces/claim-reward-error.enum';

describe('ClaimRewardService', () => {
  let service: ClaimRewardService;
  let claimService: ClaimService;
  let questsService: QuestsService;
  let lightningService: LnbitsLightningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimRewardService,
        {
          provide: ClaimService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: QuestsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: 'LightningService',
          useValue: {
            generateWithdrawUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClaimRewardService>(ClaimRewardService);
    claimService = module.get<ClaimService>(ClaimService);
    questsService = module.get<QuestsService>(QuestsService);
    lightningService = module.get<LnbitsLightningService>('LightningService');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if the token is invalid', async () => {
    await expect(service.generateWithdrawUrl({ token: '' })).rejects.toThrow(
      new HttpException(ClaimRewardError.INVALID_TOKEN, 400),
    );
  });

  it('should throw an error if the claim is not found', async () => {
    claimService.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.generateWithdrawUrl({ token: 'invalidClaimId' }),
    ).rejects.toThrow(new HttpException(ClaimRewardError.INVALID_CLAIM, 400));
  });

  it('should throw an error if the quest is not found', async () => {
    claimService.findOne = jest.fn().mockResolvedValue({ questId: 'questId' });
    questsService.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.generateWithdrawUrl({ token: 'validClaimId' }),
    ).rejects.toThrow(new HttpException(ClaimRewardError.INVALID_QUEST, 400));
  });

  it('should generate a withdraw URL if the claim and quest are valid', async () => {
    const claim = { questId: 'questId' };
    const quest = { rewardAmount: 100, title: 'Sample Quest' };
    const lnurlResponse = { url: 'http://example.com/withdraw' };

    claimService.findOne = jest.fn().mockResolvedValue(claim);
    questsService.findOne = jest.fn().mockResolvedValue(quest);
    lightningService.generateWithdrawUrl = jest
      .fn()
      .mockResolvedValue(lnurlResponse);

    const result = await service.generateWithdrawUrl({ token: 'validClaimId' });
    expect(result).toBe(lnurlResponse);
  });
});
