import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private get adminEmail() {
    const value = process.env.ADMIN_EMAIL;
    if (!value) throw new UnauthorizedException('ADMIN_EMAIL not set');
    return value;
  }

  private get adminPassword() {
    const value = process.env.ADMIN_PASSWORD;
    if (!value) throw new UnauthorizedException('ADMIN_PASSWORD not set');
    return value;
  }

  async login(email: string, password: string) {
    if (email !== this.adminEmail || password !== this.adminPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!process.env.JWT_SECRET) {
      throw new UnauthorizedException('JWT_SECRET not set');
    }
    const payload = { sub: 1, email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
