import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { MachineController } from './machine.controller';
import { MachineService } from './machine.service';


describe('MachineController', () => {
  let controller: MachineController;
  const mockResponse= () => {
    const res:any = {}
    res.send = jest.fn().mockReturnValue(res)
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    return res
  }
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [MachineController],
      providers: [MachineService]
    }).compile();

    controller = module.get<MachineController>(MachineController);
    
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('test geteventlogs', () => {
    const spyedMethod = jest.spyOn(controller, 'getEventLogs');
    const rsp = controller.getEventLogs('EV0118', mockResponse())
    
    expect(spyedMethod).toBeCalled();
  })
});
