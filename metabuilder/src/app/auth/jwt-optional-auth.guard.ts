import { AuthGuard } from '@nestjs/passport';

export class JWTOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(_, user) {
    return user;
  }
}
