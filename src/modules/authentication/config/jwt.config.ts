import { JwtModuleOptions } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: jwtConstants.accessToken_secret,
    signOptions: {
      expiresIn: jwtConstants.accessToken_expiresIn,
      algorithm: 'HS256',
    },
  }),
);
