import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerUserDTO: RegisterUserDTO): Promise<any> {
    return this.authService.register(
      registerUserDTO.email,
      registerUserDTO.password,
      registerUserDTO.name,
    );
  }

  @Post('login')
  login(@Body() signInDto: LoginUserDTO) {
    return this.authService.login(signInDto.email, signInDto.password);
  }
}
