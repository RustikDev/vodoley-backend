import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { scryptSync, timingSafeEqual } from 'node:crypto';

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

  private verifyPassword(password: string) {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    // Preferred mode for production: salted hash in env.
    if (passwordHash) {
      const [salt, hashHex] = passwordHash.split(':');
      if (!salt || !hashHex) {
        throw new UnauthorizedException('ADMIN_PASSWORD_HASH invalid format');
      }

      const hashBuffer = Buffer.from(hashHex, 'hex');
      const candidate = scryptSync(password, salt, hashBuffer.length);

      if (candidate.length !== hashBuffer.length) {
        return false;
      }

      return timingSafeEqual(candidate, hashBuffer);
    }

    // Backward compatibility for local/dev setup.
    return password === this.adminPassword;
  }

  async login(email: string, password: string) {
    if (email !== this.adminEmail || !this.verifyPassword(password)) {
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
