import { Test, TestingModule } from '@nestjs/testing';
import { SalesreportController } from './salesreport.controller';

describe('SalesreportController', () => {
  let controller: SalesreportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesreportController],
    }).compile();

    controller = module.get<SalesreportController>(SalesreportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
