import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Сухие смеси' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'suhie-smesi' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  parentId?: number;

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
