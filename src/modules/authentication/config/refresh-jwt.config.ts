import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: jwtConstants.refreshToken_secret,
    expiresIn: jwtConstants.refreshToken_expiresIn,
  }),
);
