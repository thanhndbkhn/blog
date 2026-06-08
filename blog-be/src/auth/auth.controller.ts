import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

type ReqUser = { id: string; email: string; role: string };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập — trả JWT access_token' })
  @ApiResponse({ status: 200, description: '{ access_token, user }' })
  @ApiResponse({ status: 401, description: 'Sai email hoặc mật khẩu' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin user đang đăng nhập' })
  @ApiResponse({ status: 200, description: '{ user: { id, email, role } }' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ' })
  me(@Req() req: Request & { user: ReqUser }) {
    return { user: req.user };
  }
}
