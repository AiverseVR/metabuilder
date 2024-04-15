import { UserDocument } from '@app/users/user.schema';
import { UseAuth } from '@common/decorators/request.decorator';
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { CreateSpaceDto, UpdateSpaceDto } from './space.dto';
import { SpaceService } from './space.service';
import * as AdmZip from 'adm-zip';
import { resolve } from 'path';
import { compile } from 'handlebars';
import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const baseURL = `https://${req.get('host')}`;
    return {
      url: `${baseURL}/uploads/${file.filename}`,
    };
  }

  @UseAuth()
  @Post('/')
  async createSpace(@Req() req: Request, @Body() createSpaceDto: CreateSpaceDto) {
    return this.spaceService.createSpace(req.user as UserDocument, createSpaceDto);
  }

  // @Render('space')
  @Get('/:slug')
  async getSpace(@Param('slug') slug: string, @Res() res: Response) {
    const space = await this.spaceService.getSpaceBySlug(slug, false);
    if (!space) {
      return '';
    }
    const template = space.isVR ? 'space-vr' : 'space';
    // Render hbs page
    return res.render(template, {
      title: space.name,
      description: `${space.name} is a space on Medverse, a free online tool for creating interactive 3D models.`,
      previewImage: space.previewImage,
      entities: JSON.stringify(space.entities),
      roomId: space.slug,
      spawnPoint: space.spawnPoint,
    });

    // return {
    //   title: space.name,
    //   description: `${space.name} is a space on Medverse, a free online tool for creating interactive 3D models.`,
    //   previewImage: space.previewImage,
    //   entities: JSON.stringify(space.entities),
    // };
  }

  @UseAuth()
  @Put('/:slug')
  async updateSpace(@Param('slug') slug: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spaceService.updateSpace(slug, updateSpaceDto);
  }

  @UseAuth()
  @Get(':slug/download')
  async downloadSpace(@Req() req: Request, @Param('slug') slug: string, @Res() res: Response) {
    const space = await this.spaceService.getSpaceBySlug(slug);
    const zip = new AdmZip(resolve('public', 'assets.zip'));
    const spaceTemplate = await readFileAsync(resolve('views', 'space.hbs'));
    const template = compile(spaceTemplate.toString());
    const html = template({ title: space.name, entities: JSON.stringify(space.entities) });
    zip.addFile('index.html', Buffer.from(html));
    // download the zip file
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-disposition', `attachment; filename=${space.slug}.zip`);
    res.send(zip.toBuffer());
  }
}
