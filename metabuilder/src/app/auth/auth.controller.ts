import { AuthProvider } from '@app/users/user.const';
import { uuid } from '@common/utils/string';
import { Body, Controller, Get, Param, Post, Query, Redirect, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserLoginDto, UserLoginWalletDto, UserRegisterDto } from '../users/user.dto';
import { RegisterWithWalletDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @Render('login')
  async renderLogin() {
    return {
      title: 'Login',
    };
  }

  @Get('/logout')
  @Redirect('/')
  async logout(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    req.session.destroy(() => null);
    response.clearCookie('access_token');
  }

  @Post('/login')
  async login(@Body() userLoginDto: UserLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(userLoginDto);
    response.cookie('access_token', result.access_token, { httpOnly: true });
    return result;
  }

  @Get('/login-with-wallet')
  @Render('login-with-wallet')
  async renderLoginWithWallet() {
    return {
      title: 'Login with Wallet',
    };
  }

  @Post('/login/uauth')
  async loginWithUAuth(@Res({ passthrough: true }) response: Response, @Body() body: any) {
    const uAuthAccessToken = body.accessToken;
    const result = await this.authService.loginWithUAuth(uAuthAccessToken);
    response.cookie('access_token', result.access_token, { httpOnly: true });
    return result;
  }

  @Post('/login/:provider')
  async loginWithWallet(
    @Req() req: Request,
    @Param('provider') provider: AuthProvider,
    @Body() userLoginWalletDto: UserLoginWalletDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const address = await this.authService.verifyNonce(
      req.session.nonce,
      userLoginWalletDto.signature,
      userLoginWalletDto.account,
    );
    req.session.nonce = null;
    req.session.address = address;
    const result = await this.authService.loginWithWallet(provider, userLoginWalletDto);
    response.cookie('access_token', result.access_token, { httpOnly: true });
    return result;
  }

  @Get('/register')
  @Render('register')
  async renderRegister() {
    return {
      title: 'Register',
    };
  }

  @Post('/register')
  async register(@Body() userRegisterDto: UserRegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(userRegisterDto);
    response.cookie('access_token', result.access_token, { httpOnly: true });
    return result;
  }

  @Post('/register/:provider')
  async registerWithWallet(
    @Req() req: Request,
    @Param('provider') provider: AuthProvider,
    @Body() registerDto: RegisterWithWalletDto,
  ) {
    const { requireEmail } = await this.authService.registerWithWallet(provider, registerDto);
    const nonce = uuid();
    req.session.nonce = nonce;
    const nonceTemplate = this.authService.buildNonceTemplate(nonce);
    return {
      requireEmail,
      nonce: nonceTemplate,
    };
  }
}
