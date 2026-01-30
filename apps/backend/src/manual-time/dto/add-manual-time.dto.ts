import { IsString, IsDateString, IsInt, Min, IsEnum, IsUUID } from 'class-validator';
import { TimeEntryKind } from '@prisma/client';

export class AddManualTimeDto {
  @IsUUID()
  userId: string;

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
