import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './common/guards/login.guard';
import { AuthenticatedGuard } from './common/guards/authenticated.guard';
import { OwnerService } from './owner/owner.service';

@Controller()
export class AppController {

  constructor(
    private oService: OwnerService
  ){}

  @Get()
  main(@Res() res) {
    res.redirect('/login');
  }

  @Get('login')
  loginForm(@Request() req, @Res() res:Response) {
    res.render('login', { layout: false });
  }

  @UseGuards(LoginGuard)
  @Post('/auth/login')
  async login(@Request() req, @Res() res) {
    const host = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    this.oService.insertLoginLog(req.user.ON_OwnerID, host, true, req.user.schema );
    res.redirect('/machine');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/home')
  home(@Request() req, @Res() res:Response) {
    res.render('pages/home', { user: req.user, title: req.user.schema });
  }

  @Get('/logout')
  logout(@Request() req, @Res() res: Response) {
    req.logout((error) => {
      if(error) {
        return error;
      } 
      res.redirect('/');
    });
    
  }

}
