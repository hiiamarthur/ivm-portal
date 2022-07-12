import { Controller, Get, Post, Res, Render, Body, HttpStatus } from '@nestjs/common';
import { MasterService } from '../master/master.service';
import { MachineService } from './machine.service';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams, handleColumnSorter } from '../common/helper/requestParamsHandler';

@Controller('machine')
export class MachineController {

    

}
