import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import * as session from 'express-session';
import flash = require('connect-flash');
import * as exphbs from 'express-handlebars';
import * as passport from 'passport';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const viewsPath = join(__dirname, '..', 'public/views');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  app.engine('.hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', partialsDir: join(__dirname, '..', 'public/views', 'partials'), helpers: require('./common/helper/handlebars-helpers') }));
  app.set('views', viewsPath);
  app.set('view engine', '.hbs');
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(
    session({
      //for demo only
      secret: 'vQtTgc3Jv95cddr3ztUzES4dvSnibk5RuVURfxLxpSy2Th4QSBSppRrhihjhNG2Uic26utK6Be7Fpkk5mDrUydRCEA7Sz5KBpEqLzK2uE25qTqJarR2wVxFTFSG',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  await app.listen(3000, '0.0.0.0');

}
bootstrap();