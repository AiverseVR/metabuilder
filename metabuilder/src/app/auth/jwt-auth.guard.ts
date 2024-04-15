import { AuthGuard } from '@nestjs/passport';

export class JWTAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, _, context) {
    if (err) {
      console.log(err);
      throw err;
    }
    if (!user) {
      const response = context.switchToHttp().getResponse();
      response.redirect('/auth/login');
      return;
    }
    return user;
  }
}
