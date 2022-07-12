import { Controller, Get, Post, Request, Res, Render, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { DashboardService } from './dashboard.service';
 
@Controller('dashboard')
@UseGuards(AuthenticatedGuard)
export class DashboardController {

    constructor(private readonly service: DashboardService){}

    @Get('/paymentOrderSummary')
    async getPaymentOrderSummary(@Request() req) {
        const dateFrom = req.body.dateFrom;
        const dateTo = req.body.dateTo;
        const ownerId = req.user.ONL_OwnerID;
        const rawData = this.service.getPaymentOrderSummary(dateFrom, dateTo, ownerId);
        return { data: rawData }
    }

    @Get('/productOrderSummary')
    async getProductOrderSummary(@Request() req) {
        const dateFrom = req.body.dateFrom;
        const dateTo = req.body.dateTo;
        const ownerId = req.user.ONL_OwnerID;
        const rawData = this.service.getProductOrderSummary(dateFrom, dateTo, ownerId);
        return { data: rawData }
    }

    @Get('/locationOrderSummary')
    async getLocationOrderSummary(@Request() req){
        const dateFrom = req.body.dateFrom;
        const dateTo = req.body.dateTo;
        const ownerId = req.user.ONL_OwnerID;
        const rawData = this.service.LocationOrderSummary(dateFrom, dateTo, ownerId);
        return { data: rawData }
    }
}
