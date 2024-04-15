import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly axiosInstance = axios.create();
  private readonly fakeHeaders = {
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36',
  };

  constructor() {
    for (const [key, value] of Object.entries(this.fakeHeaders)) {
      this.axiosInstance.defaults.headers.common[key] = value;
    }
  }

  async get(url: string, res: Response) {
    if (!url) throw new BadRequestException('Missing url parameter');
    try {
      // Check url is image
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
      const urlExtension = url.split('.').pop();
      const isImage = allowedExtensions.includes(urlExtension);
      const config: AxiosRequestConfig = isImage ? { responseType: 'stream' } : {};
      const response = await this.axiosInstance.get(url, {
        ...config,
      });
      res.set({
        'Content-Type': response.headers['content-type'],
      });
      if (response.data.pipe) {
        response.data.pipe(res);
        return;
      }
      res.send(response.data);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
        },
        error.response?.status || 500,
      );
    }
  }
}
