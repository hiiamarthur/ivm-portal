import { Controller, Get, Post, Param, Delete, Request, UseGuards, Render, UnauthorizedException, Body, Query, Res, HttpStatus, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
        const { ON_OwnerID, schema } = req.user;
        const data = await this.service.getOwnerList({...reqBody, schema: schema});
        data.data = data.data.filter(d => d.id !== ON_OwnerID );
        res.status(HttpStatus.OK).json(data);
    }

    
    @Get('create')
    @Render('pages/owner/userform')
    async userForm(@Request() req) {
        this.handleRequest(req);
        const machineList = await this.service.getOwnerMachine({ schema: req.user.schema });
        return { ...req, machineList: machineList, Editable: true, showPasswordField: true }
    }

    @Post('update')
    async updateUser(@Request() req, @Body() reqBody, @Res() res) {
        this.handleRequest(req);
        if(!reqBody.owner || !reqBody.permissions) {
            throw new BadRequestException('Missing required params');
        }
        
        try{
            const params:any = { owner: reqBody.owner, schema: req.user.schema }
            if(reqBody.machineIds) {
                params.machineIds = handleArrayParams(reqBody.machineIds);
            }
            let updated = await this.service.updateOwner(params);
            if(reqBody.permissions){
                const updatedPermission = await this.service.updateOwnerPermission({ schema: req.user.schema, permissions: reqBody.permissions})
                updated = { ...updated, permissions: updatedPermission }
            }
            res.status(HttpStatus.OK).json({ user: req.user, ...updated });
        } catch(error) {
            throw new InternalServerErrorException(error);
        }
    }

    @Post('change-password')
    async changePassword(@Request() req, @Body() reqBody, @Res() res) {
        try {
            await this.service.changePassword({ ...reqBody, schema: req.user.schema })
            res.status(HttpStatus.OK).json({ message: 'change pasword success' })
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).json({ message: error.message })
        }
    }

    @Delete(':ownerId')
    async deleteUser(@Request() req, @Param('ownerId') ownerId, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.deleteOwner({ schema: schema, ownerId: ownerId })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            new InternalServerErrorException(error);
        }
    }

    @Get('profile')
    @Render('pages/owner/userform')
    async getProfile(@Request() req, @Query('ownerId') ownerId) {

        if(!req.user) {
            throw new UnauthorizedException('no login user')
        }
        const userProfile = await this.service.findAOwner({ schema: req.user.schema, ownerId: ownerId});
        const rtn = { ...userProfile, expireOn: format(userProfile.login.ONL_ExpireDate, 'dd-MM-yyyy')}
        const machineList = await this.service.getOwnerMachine({ schema: req.user.schema })
        const selectedMachines = userProfile.isSuperAdmin ? await this.service.getOwnerMachine({ schema: req.user.schema }): await this.service.getOwnerMachine({ ownerId: ownerId, schema: req.user.schema });
        return { user: req.user, userProfile: rtn, Editable: req.user.isSuperAdmin ? true : false, machineList: machineList, selectedMachines: selectedMachines }
    }
 

    handleRequest(request){
        if(!request.user) {
            throw new UnauthorizedException('no login user')
        }
        if(!request.user.isSuperAdmin) {
            throw new UnauthorizedException('You are not admin')
        }
    }
}
