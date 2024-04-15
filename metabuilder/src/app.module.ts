import { DashboardModule } from '@app/dashboard/dashboard.module';
import { ProxyModule } from '@app/proxy/proxy.module';
import { SpaceModule } from '@app/spaces/space.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/users/user.module';
import { ThetaVideoModule } from '@app/theta-video/theta-video.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    AuthModule,
    UserModule,
    DashboardModule,
    SpaceModule,
    ProxyModule,
    ThetaVideoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
