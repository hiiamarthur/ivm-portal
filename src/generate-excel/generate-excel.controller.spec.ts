import { Test, TestingModule } from '@nestjs/testing';
import { GenerateExcelController } from './generate-excel.controller';

describe('GenerateExcelController', () => {
  let controller: GenerateExcelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerateExcelController],
    }).compile();

    controller = module.get<GenerateExcelController>(GenerateExcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
