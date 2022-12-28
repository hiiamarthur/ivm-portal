import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import * as session from 'express-session';
import flash = require('connect-flash');
import * as exphbs from 'express-handlebars';
import * as passport from 'passport';

async function bootstrap() {

  const loggerFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(a => `${a.timestamp} [${a.level}]: ${a.message}`)
  )

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    //process.env.NODE_ENV === 'dev' ? ['log', 'debug', 'error', 'verbose', 'warn'] : ['log', 'error', 'warn'],
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({ 
          format: loggerFormat
        }),
        new winston.transports.File({
          filename: join(__dirname, '..','log','errors.log'),
          level: 'error',
          format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.uncolorize(),
            winston.format.timestamp(),
            winston.format.printf(a => `${a.timestamp} [${a.level}]: ${a.message}`)
          ),
          handleExceptions: true,
          handleRejections: true
        })
      ],
      exitOnError: false
    })
  });

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

  // (prod) await app.listen(3015, '0.0.0.0');
  await app.listen(3456, '0.0.0.0'); //dev

}
bootstrap();