import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ example: 'Knauf' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'knauf' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Немецкий производитель строительных материалов' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://knauf.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
