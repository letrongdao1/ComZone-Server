import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { PasswordResetDTO } from './dto/password-reset.dto';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async register(email: string, password: string, name: string) {
    const checkEmail = await this.usersService.getUserByEmail(email);
    if (checkEmail) {
      throw new ConflictException(
        'Email conflict',
        'This email has already been used!',
      );
    } else {
      const hashed = bcrypt.hashSync(password, 10);
      return {
        message: 'A new account was created successfully!',
        metadata: await this.usersService.create({
          email,
          password: hashed,
          name,
          role: 'MEMBER',
        }),
      };
    }
  }

  async validateUser(loginUserDto: LoginUserDTO): Promise<any> {
    const user = await this.usersService.getUserByEmail(loginUserDto.email);
    if (!user) {
      throw new NotFoundException('Email cannot be found!');
    }

    if (user.status === 'banned') {
      throw new UnauthorizedException('User is banned');
    }

    if (!bcrypt.compareSync(loginUserDto.password, user?.password)) {
      throw new UnauthorizedException('Incorrect password!');
    }

    await this.usersService.updateLastActive(user.id);

    return user;
  }

  async validateJwtUser(userId: string): Promise<any> {
    const user = await this.usersService.getOne(userId);
    if (!user) {
      throw new UnauthorizedException('User cannot be found!');
    }

    await this.usersService.updateLastActive(user.id);

    return {
      id: user.id,
    };
  }

  async validateGoogleUser(googleUser: RegisterUserDTO) {
    // Validate that googleUser contains necessary properties
    if (!googleUser || !googleUser.email) {
      throw new Error('Invalid Google user data');
    }

    let user = await this.usersService.getUserByEmail(googleUser.email);

    if (!user) {
      // Ensure no null or undefined values are passed to createMemberAccount
      if (!googleUser.name || !googleUser.email) {
        throw new Error('Missing required user data for account creation');
      }
      user = await this.usersService.createMemberAccount(googleUser);
    }

    await this.usersService.updateLastActive(user.id);

    return user;
  }

  async login(userId: string) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);

    const user = await this.usersService.getOne(userId);

    return {
      id: userId,
      isMod: user.role === 'MODERATOR',
      isAdmin: user.role === 'ADMIN',
      accessToken,
      refreshToken,
    };
  }

  refreshToken(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const token = this.jwtService.sign(payload);
    return {
      id: userId,
      token,
    };
  }

  async validateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.getOne(userId);
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Invalid refresh token!');
    }
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid refresh token!');

    return { id: userId };
  }

  async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(payload),
      this.jwtService.sign(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserIdByAccessToken(token: string) {
    return jwtDecode(token).sub || null;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return {
      message: 'Logout successfully!',
    };
  }

  async resetPassword(userId: string, passwordResetDto: PasswordResetDTO) {
    const user = await this.usersService.getOneWithPassword(userId);

    if (!bcrypt.compareSync(passwordResetDto.oldPassword, user.password)) {
      throw new UnauthorizedException('Incorrect password!');
    }

    return await this.usersService
      .updatePassword(userId, bcrypt.hashSync(passwordResetDto.newPassword, 10))
      .then(() => this.usersService.getOne(userId));
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.getOneWithPassword(userId);

    if (!bcrypt.compareSync(oldPassword, user.password)) {
      throw new BadRequestException('Incorrect password!');
    }

    return await this.usersService
      .updatePassword(userId, bcrypt.hashSync(newPassword, 10))
      .then(() => this.usersService.getOne(userId));
  }

  async registerModeratorOrAdminAccount(
    email: string,
    pass: string,
    name: string,
    role: 'MODERATOR' | 'ADMIN',
  ) {
    const checkEmail = await this.usersService.getUserByEmail(email);
    if (checkEmail) {
      throw new ConflictException(
        'Email conflict',
        'This email has already been used!',
      );
    } else if (role !== 'MODERATOR' && role !== 'ADMIN') {
      throw new BadRequestException();
    } else {
      const hashed = bcrypt.hashSync(pass, 10);
      return {
        message: 'A new account was created successfully!',
        metadata: await this.usersService.create({
          email,
          password: hashed,
          name,
          role,
        }),
      };
    }
  }
}
