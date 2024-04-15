import { IsEthereumAddress, IsString } from 'class-validator';

export class RegisterWithWalletDto {
  @IsString()
  @IsEthereumAddress()
  publicAddress: string;
}
