import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ThetaVideoService {
  private readonly _axios = axios.create({
    baseURL: 'https://api.thetavideoapi.com',
    headers: {
      'x-tva-sa-id': process.env.THETA_VIDEO_API_KEY,
      'x-tva-sa-secret': process.env.THETA_VIDEO_API_SECRET,
    },
  });

  signURL() {
    return this._axios.post('/upload').then((res) => res.data.body.uploads[0]);
  }
}
