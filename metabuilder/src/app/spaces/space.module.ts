import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { SpaceController } from './space.controller';
import { Space, SpaceSchema } from './space.schema';
import { SpaceService } from './space.service';
import { diskStorage } from 'multer';
import { randomString } from '@common/utils/string';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Space.name, schema: SpaceSchema }]),
    MulterModule.register({
      dest: './public/uploads',
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_, file, cb) => {
          // console.log(file);
          const fileParts = file.originalname.split('.');
          const extension = fileParts[fileParts.length - 1];
          const filename = fileParts.slice(0, fileParts.length - 1).join('.');
          cb(null, `${filename}-${randomString(8)}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [SpaceController],
  providers: [SpaceService],
  exports: [SpaceService],
})
export class SpaceModule {}
