import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const checkEmail = await this.usersService.findAccountByEmail(email);
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
        }),
      };
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findAccountByEmail(email);
    if (user && bcrypt.compareSync(pass, user?.password)) {
      const { password, ...result } = user;
      console.log(result);
      return result;
    } else {
      console.log('User not found!');
    }
    return null;
  }

  async login(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findAccountByEmail(email);
    if (!user) {
      throw new NotFoundException('Email cannot be found!');
    } else if (!bcrypt.compareSync(pass, user?.password)) {
      throw new UnauthorizedException('Incorrect password!');
    } else {
      const { password, ...payload } = user;
      return {
        message: 'Login successfully!',
        access_token: await this.jwtService.signAsync(payload),
      };
    }
  }
}
