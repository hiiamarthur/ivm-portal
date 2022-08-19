import { Controller, Get, Post, Request, UseGuards, Render, UnauthorizedException, Body, Query } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { OwnerService } from './owner.service';

@UseGuards(AuthenticatedGuard)
@Controller('owner')
export class OwnerController {

    constructor(
        private service: OwnerService
      ){}
    
    @Get()
    @Render('pages/owner/userlist')
    idxPage(@Request() req) {
        return { user: req.user }
    }

    @Post('list')
    async listUser(@Body() reqBody) {
        const data = await this.service.getOwnerList(reqBody);
        return { users: data };
    }

    
    @Get('create')
    @Render('pages/owner/userform')
    async userForm(@Request() req) {
        this.handleRequest(req);
        //const machineList = await this.masterService.getAllMachineList();
        //return { machineList: machineList, isCreate: true }
    }

    @Post('update')
    async updateUser(@Request() req, @Body() reqBody) {
        this.handleRequest(req);
        const { owner, permissions } = reqBody;
        const updated = await this.service.updateOwner(owner);

        return { ...updated, permissions: permissions }
    }

    @Get('profile')
    @Render('pages/owner/userform')
    async getProfile(@Request() req, @Query('ownerId') ownerId) {
        if(!req.user) {
            throw new UnauthorizedException('no login user')
        }
        
        const userProfile = await this.service.getAOwner(ownerId);
        return { user: req.user, userProfile: userProfile, isEdit: req.user.isSuperAdmin ? true : false }
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
