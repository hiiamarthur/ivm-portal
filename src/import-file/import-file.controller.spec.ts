import { Test, TestingModule } from '@nestjs/testing';
import { ImportFileController } from './import-file.controller';

describe('ImportFileController', () => {
  let controller: ImportFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportFileController],
    }).compile();

    controller = module.get<ImportFileController>(ImportFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
