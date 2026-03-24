import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

class LoginDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  password: string;
}

@ApiTags('Admin / Auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @Throttle({
    default: {
      limit: Number(process.env.AUTH_THROTTLE_LIMIT ?? 5),
      ttl: Number(process.env.AUTH_THROTTLE_TTL_MS ?? 60_000),
    },
  })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
