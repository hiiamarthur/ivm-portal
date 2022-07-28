import { Controller, Get, Post, Request, Res, Body, UseGuards, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './common/guards/login.guard';
import { AuthenticatedGuard } from './common/guards/authenticated.guard';

@Controller()
export class AppController {

  @Get()
  loginForm(@Request() req, @Res() res:Response) {
    const host = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    res.render('login', { layout: false });
  }

  @UseGuards(LoginGuard)
  @Post('/auth/login')
  async login(@Request() req, @Res() res) {
    
    res.redirect('/home');
  }

  //@UseGuards(AuthenticatedGuard)
  @Get('/home')
  home(@Request() req, @Res() res:Response) {
    res.render('pages/home', { user: req.user, title: "Welcome to IVM WebPortal" });
  }

  @UseGuards(AuthenticatedGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return { user: req.user };
  }

  @Get('/logout')
  logout(@Request() req, @Res() res: Response) {
    req.logout();
    res.redirect('/');
  }
}
