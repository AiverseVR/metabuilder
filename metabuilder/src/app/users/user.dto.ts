import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}

export class UserLoginWalletDto {
  @IsString()
  signature: string;

  @IsString()
  account: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;
}

export class UserRegisterDto extends UserLoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(32)
  name: string;
}
