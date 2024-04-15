import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import * as hbs from 'hbs';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        signed: true,
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe());

  app.setViewEngine('hbs');

  app.useStaticAssets(resolve('public'));
  app.setBaseViewsDir(resolve('views'));
  hbs.registerPartials(resolve('views', 'partials'));

  await app.listen(process.env.PORT || 5000);

  return app;
}
bootstrap()
  .then((app) => app.getUrl())
  .then((url) => Logger.log(`Server running on ${url}`, 'Bootstrap'));
