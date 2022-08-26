import { Controller, Get, Post, Delete, Request, UseGuards, Render, UnauthorizedException, Body, Query, Res, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { OwnerService } from './owner.service';
import { format } from 'date-fns';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams } from '../common/helper/requestHandler';

@UseGuards(AuthenticatedGuard)
@Controller('owner')
export class OwnerController {

    constructor(
        private service: OwnerService
      ){}
    
    @Get()
    @Render('pages/owner/userlist')
    idxPage(@Request() req) {
        const columnOps = getColumnOptions('owners')
        return { user: req.user, columnOp: columnOps, activeOnly: true }
    }

    @Post('list')
    async listUser(@Request() req, @Body() reqBody, @Res() res) {
        const { ON_OwnerID } = req.user;
        const data = await this.service.getOwnerList(reqBody);
        data.data = data.data.filter(d => d.id !== ON_OwnerID );
        return res.status(HttpStatus.OK).json(data);
    }

    
    @Get('create')
    @Render('pages/owner/userform')
    async userForm(@Request() req) {
        this.handleRequest(req);
        const machineList = await this.service.getOwnerMachine();
        return { ...req, machineList: machineList, Editable: true, showPasswordField: true }
    }

    @Post('update')
    async updateUser(@Request() req, @Body() reqBody, @Res() res) {
        this.handleRequest(req);
        if(!reqBody.owner || !reqBody.permissions) {
            throw new BadRequestException('Missing required params');
        }
        
        try{
            const params = { ...reqBody.owner }
            if(reqBody.machineIds) {
                params.machineIds = handleArrayParams(reqBody.machineIds);
            }
            let updated = await this.service.updateOwner(params);
            if(reqBody.permissions){
                const updatedPermission = await this.service.updateOwnerPermission(reqBody.permissions)
                updated = { ...updated, permissions: updatedPermission }
            }
            return res.status(HttpStatus.OK).json({ user: req.user, ...updated });
        } catch(error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('delete')
    async deleteUser(@Request() req, @Body() reqBody, @Res() res) {
        this.handleRequest(req);
        const { ownerId } = reqBody;
        try {
            await this.service.deleteOwner(ownerId)
            return res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Get('profile')
    @Render('pages/owner/userform')
    async getProfile(@Request() req, @Query('ownerId') ownerId) {

        if(!req.user) {
            throw new UnauthorizedException('no login user')
        }
        const userProfile = await this.service.getAOwner(ownerId);
        const rtn = { ...userProfile, expireOn: format(userProfile.login.ONL_ExpireDate, 'dd-MM-yyyy')}
        const machineList =await this.service.getOwnerMachine()
        const selectedMachines = userProfile.isSuperAdmin ? await this.service.getOwnerMachine(): await this.service.getOwnerMachine(ownerId);
        return { user: req.user, userProfile: rtn, Editable: req.user.isSuperAdmin ? true : false, machineList: machineList, selectedMachines: selectedMachines }
    }

    // @Get('machine-list')
    // async getOwnerMachineList(@Query('ownerId') ownerId, @Res() res) {
    //     const data = await this.service.getOwnerMachine(ownerId);
    //     return res.status(HttpStatus.OK).json(data);
    // }   

    handleRequest(request){
        if(!request.user) {
            throw new UnauthorizedException('no login user')
        }
        if(!request.user.isSuperAdmin) {
            throw new UnauthorizedException('You are not admin')
        }
    }
}
