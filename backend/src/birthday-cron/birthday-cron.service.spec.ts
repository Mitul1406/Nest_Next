import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayCronService } from './birthday-cron.service';

describe('BirthdayCronService', () => {
  let service: BirthdayCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BirthdayCronService],
    }).compile();

    service = module.get<BirthdayCronService>(BirthdayCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
