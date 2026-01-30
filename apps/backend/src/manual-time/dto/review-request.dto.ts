import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ManualTimeStatus } from '@prisma/client';

export class ReviewRequestDto {
  @IsEnum(ManualTimeStatus)
  status: ManualTimeStatus;

  @IsString()
  @IsOptional()
  reviewNote?: string;
}
