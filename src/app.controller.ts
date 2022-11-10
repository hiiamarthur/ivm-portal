import { Controller, Get, Post, Request, Res, UseGuards, HttpStatus, BadRequestException, Inject, Logger, LoggerService } from '@nestjs/common';
import { Response } from 'express';

import { LoginGuard } from './common/guards/login.guard';
import { AuthenticatedGuard } from './common/guards/authenticated.guard';
import { OwnerService } from './owner/owner.service';

@Controller()
export class AppController {

  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private oService: OwnerService
  ){}

  @Get()
  main(@Res() res) {
    res.redirect('/login');
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

  @UseGuards(AuthenticatedGuard)
  @Get('/home')
  home(@Request() req, @Res() res:Response) {
    res.render('pages/home', { user: req.user, title: req.user.schema });
  }

  @Get('testerror')
  renderErrorPage(@Res() res:Response) {
    this.logger.error('test logging error')
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ aaa: 'aaa'})
  }

  @Get('catchError')
  catchError() {
    throw new BadRequestException('test throwing exception');
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
