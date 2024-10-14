import * as dotenv from 'dotenv';
dotenv.config();

export const jwtConstants = {
  accessToken_secret: Buffer.from(
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
  ).toString('base64'),
  accessToken_expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  refreshToken_secret: Buffer.from(
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
  ).toString('base64'),
  refreshToken_expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
};
