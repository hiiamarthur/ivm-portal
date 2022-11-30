import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './common/guards/login.guard';
import { OwnerService } from './owner/owner.service';

@Controller()
export class AppController {

  constructor(
    private oService: OwnerService
  ){}

  @Get()
  main(@Request() req, @Res() res) {
    if(req.user) {
      res.redirect('/machine');
    } else {
      res.redirect('/login');
    }
  }

  @Get('login')
  loginForm(@Res() res:Response) {
    res.render('login', { layout: false });
  }

  @UseGuards(LoginGuard)
  @Post('/auth/login')
  async login(@Request() req, @Res() res) {
    const host = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    this.oService.insertLoginLog(req.user.username, host, true, req.user.schema );
    res.redirect('/machine');
  }

  // testing page
  //@UseGuards(AuthenticatedGuard)
  @Get('/home')
  home(@Request() req, @Res() res:Response) {
    res.render('pages/home');
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
