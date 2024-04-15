import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto, UserLoginWalletDto, UserRegisterDto } from '../users/user.dto';
import { UserDocument } from '../users/user.schema';
import { UserService } from '../users/user.service';
import { utils } from 'ethers';
import { RegisterWithWalletDto } from './auth.dto';
import { AuthProvider } from '@app/users/user.const';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService, private jwtService: JwtService) {}

  private nonceTemplate = 'Welcome to Medverse! Click "Sign" to sign in. No password needed! Your nonce: {{nonce}}';

  buildNonceTemplate(nonce: string) {
    return this.nonceTemplate.replace('{{nonce}}', nonce);
  }

  async verifyNonce(nonce: string, signature: string, account: string) {
    const message = this.buildNonceTemplate(nonce);
    const result = utils.verifyMessage(message, signature);
    if (result.toLowerCase() !== account.toLowerCase()) {
      throw new BadRequestException('Invalid signature, please reload the page and try again.');
    }
    return result.toLowerCase();
  }

  async login(userLoginDto: UserLoginDto) {
    const user = await this.usersService.findAndValidateUser(userLoginDto);
    return this._createAuthResponse(user);
  }

  async register(userRegisterDto: UserRegisterDto) {
    const user = await this.usersService.createUser(userRegisterDto);
    return this._createAuthResponse(user);
  }

  async registerWithWallet(provider: AuthProvider, registerDto: RegisterWithWalletDto) {
    const user = await this.usersService.findUserByProviderId(provider, registerDto.publicAddress);
    console.log(user);
    const requireEmail = !user;
    return {
      requireEmail,
    };
  }

  async loginWithWallet(provider: AuthProvider, loginDto: UserLoginWalletDto) {
    const user = await this.usersService.upsertUserByProviderId(provider, loginDto.account, loginDto.email);
    return this._createAuthResponse(user);
  }

  async loginWithUAuth(accessToken: string) {
    try {
      const response = await axios.get('https://auth.unstoppabledomains.com/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const email = response.data.email;
      const username = response.data.sub;

      const user = await this.usersService.upsertUserByProviderId(AuthProvider.UAUTH, username, email);
      return this._createAuthResponse(user);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid uAuth access token');
    }
  }

  _createAuthResponse(user: UserDocument) {
    const payload = { email: user.email, sub: user._id };
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
      user: {
        email: user.email,
        name: user.name,
      },
    };
  }
}
