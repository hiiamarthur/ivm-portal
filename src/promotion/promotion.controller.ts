import { Logger, Controller, Post, Res, Body, Request, UseGuards, HttpStatus, BadRequestException } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('promotion')
export class PromotionController {

    constructor(
        private service: PromotionService,
        private readonly logger: Logger
    ){}
    
    @Post('voucher')
    async getCampaignVoucher(@Request() req, @Body() reqBody, @Res() res) {
        this.logger.debug(`[PromotionController] getVoucherData? ${JSON.stringify({ ...req.user, ...reqBody})}`);
        let voucherData;
        try {
            voucherData = await this.service.getPromoVoucherData({ ...reqBody, ...req.user });
            res.status(HttpStatus.OK).json(voucherData);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Post('voucher/update')
    async updateVoucher(@Request() req, @Body() reqBody, @Res() res){
        this.logger.log(`[PromotionController] updateVoucher? ${JSON.stringify({ ...req.user, ...reqBody})}`)
        try {
            const result = await this.service.updatePromoVoucher({ ...reqBody, ...req.user });
	    this.logger.debug(`[PromotionController] updateVoucher result: ${JSON.stringify(result)}`)
        } catch (error) {
            throw new BadRequestException(error);
        }
        res.status(HttpStatus.OK).json({ "message": "success" })
    }
}
