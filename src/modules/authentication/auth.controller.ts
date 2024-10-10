import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterUserDTO } from './dto/register-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCreatedResponse()
  @Post('register')
  register(@Body() registerUserDTO: RegisterUserDTO): Promise<any> {
    return this.authService.register(
      registerUserDTO.email,
      registerUserDTO.password,
      registerUserDTO.name,
    );
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: any, @Body() loginUserDto: LoginUserDTO) {
    return this.authService.login(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req: any) {
    return this.authService.refreshToken(req.user.id);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  @ApiExcludeEndpoint()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req: any, @Res() res: any) {
    const response = await this.authService.login(req.user.id);
    res.redirect(`http://localhost:5173?token=${response.accessToken}`);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('register/moderator')
  registerModeratorAccount(
    @Body() registerUserDTO: RegisterUserDTO,
  ): Promise<any> {
    return this.authService.registerModeratorOrAdminAccount(
      registerUserDTO.email,
      registerUserDTO.password,
      registerUserDTO.name,
      3,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post('register/admin')
  registerAdminAccount(@Body() registerUserDTO: RegisterUserDTO): Promise<any> {
    return this.authService.registerModeratorOrAdminAccount(
      registerUserDTO.email,
      registerUserDTO.password,
      registerUserDTO.name,
      4,
    );
  }
}
