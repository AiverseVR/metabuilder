import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '@/app/auth/roles.guard';
import { Role } from '@/app/users/user.const';
import { JWTAuthGuard } from '@app/auth/jwt-auth.guard';
import { JWTOptionalAuthGuard } from '@app/auth/jwt-optional-auth.guard';

export function UseAuth(...roles: Role[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(JWTAuthGuard, RolesGuard));
}

export function UseOptionalAuth(...roles: Role[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(JWTOptionalAuthGuard));
}
