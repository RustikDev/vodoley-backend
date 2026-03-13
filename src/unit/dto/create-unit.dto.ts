import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  name: string;

  @IsString()
  shortName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
