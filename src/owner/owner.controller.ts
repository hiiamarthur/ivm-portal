import { Controller, Get, Post, Param, Delete, Request, UseGuards, Render, UnauthorizedException, Body, Query, Res, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { OwnerService } from './owner.service';
import { CampaignService } from '../campaign/campaign.service';
import { format } from 'date-fns';
import { getColumnOptions } from '../entities/columnNameMapping';
import { handleArrayParams } from '../common/helper/requestHandler';

@UseGuards(AuthenticatedGuard)
@Controller('owner')
export class OwnerController {

    constructor(
        private service: OwnerService,
        private campaignService: CampaignService
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
        const sort = this.handleSorting(reqBody.order);
        const data = await this.service.getOwnerList({...reqBody, sort: sort,schema: schema, username: ON_OwnerID });
        res.status(HttpStatus.OK).json(data);
    }

    
    @Get('create')
    @Render('pages/owner/userform')
    async userForm(@Request() req) {
        this.handleRequest(req);
        const { schema } = req.user;
        const machineList = await this.service.getOwnerMachine({ schema: schema });
        const campaignList = await this.campaignService.getCampaigns({ schema: schema, listAll: true })
        return { ...req, machineList: machineList, campaignList: campaignList, showPasswordField: true }
    }

    @Post('validate-id')
    async validateId(@Request() req, @Body() reqBody, @Res() res) {
        const exist = await this.service.checkIdIsUsed({
            schema: req.user.schema,
            ...reqBody
        })
        if(exist){
            res.status(HttpStatus.BAD_REQUEST).json({ message: 'OwnerID or LoginID is used'});
        } else {
            res.status(HttpStatus.OK).json({ message: 'OK' })
        }
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
            if(reqBody.campaignIds) {
                params.campaignIds = handleArrayParams(reqBody.campaignIds);
            }
            await this.service.updateOwner(params);
            if(reqBody.permissions){
                await this.service.updateOwnerPermission({ schema: req.user.schema, permissions: reqBody.permissions})
            }
            res.status(HttpStatus.OK).json({ message: 'update success'});
        } catch(error) {
            throw new BadRequestException(error);
        }
    }

    @Post('change-password')
    async changePassword(@Request() req, @Body() reqBody, @Res() res) {
        try {
            await this.service.changePassword({ ...reqBody, schema: req.user.schema })
            res.status(HttpStatus.OK).json({ message: 'change pasword success' })
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Delete(':loginId')
    async deleteUser(@Request() req, @Param('loginId') loginId, @Res() res) {
        const { schema } = req.user;
        try {
            await this.service.deleteOwnerLogin({ schema: schema, loginId: loginId })
            res.status(HttpStatus.OK).json({ message: 'success' })
        } catch (error) {
            throw new NotFoundException(error);
        }
    }

    @Get('profile')
    @Render('pages/owner/userform')
    async getProfile(@Request() req, @Query('loginId') loginId) {
        const { schema } = req.user;
        const ownerLogin = await this.service.findAOwner({ schema: schema, loginId: loginId });
        const rtn = { ...ownerLogin.owner, username: ownerLogin.ONL_Login, password: ownerLogin.ONL_Password, expireOn: format(ownerLogin.ONL_ExpireDate, 'yyyy-MM-dd')}
        const machineList = await this.service.getOwnerMachine({ schema: schema })
        const selectedMachines = ownerLogin.owner.isSuperAdmin ? await this.service.getOwnerMachine({ schema: schema }): 
            await this.service.getOwnerMachine({ ownerId: ownerLogin.owner.ON_OwnerID, schema: schema });
        const campaignList = await this.service.getOwnerCampaigns({ schema: schema });
        let selectedCampaigns;
        if(ownerLogin.owner.permissionsMap['campaignvoucher'] && !ownerLogin.owner.isSuperAdmin) {
            selectedCampaigns = await this.service.getOwnerCampaigns({ schema: schema, ownerId:  ownerLogin.owner.ON_OwnerID })
        }
        return { user: req.user, userProfile: rtn, machineList: machineList, selectedMachines: selectedMachines, campaignList: campaignList, selectedCampaigns: selectedCampaigns }
    }

    handleRequest(request){
        if(!request.user) {
            throw new UnauthorizedException('no login user')
        }
        if(!request.user.isSuperAdmin) {
            throw new UnauthorizedException('You are not admin')
        }
    }

    handleSorting(order) {
        const mapping = ['owner.ON_OwnerID', 'login.ONL_Login', 'owner.ON_OwnerName', 'owner.ON_OwnerNameEng', '', '', 'login.ONL_ExpireDate', 'owner.ON_Lastupdate']
        if(order && order.length > 0) {
            return order.map(o => {
                return { column: mapping[Number(o['column'])], dir: o['dir'].toUpperCase() }
            })
        }
        return null;
    }
}
