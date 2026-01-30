import { IsString, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { TimeEntryKind } from '@prisma/client';

export class CreateManualTimeRequestDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsInt()
  @Min(1)
  minutes: number;

  @IsString()
  reason: string;

  @IsEnum(TimeEntryKind)
  type: TimeEntryKind;
}
