import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  _matchRoles(expectedRoles: number[], userRoles: number): boolean {
    if (expectedRoles.length === 0) {
      return true;
    }
    return expectedRoles.some((role) => userRoles % role === 0);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<number[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    return this._matchRoles(roles, user.roles);
  }
}
