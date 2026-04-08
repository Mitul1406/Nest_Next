import { IsOptional, IsString, IsNumberString, Matches } from 'class-validator';

export class FilterExpenseDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in YYYY-MM-DD format',
  })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'minAmount must be a number' })
  minAmount?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'maxAmount must be a number' })
  maxAmount?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a number' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number' })
  limit?: string;

  @IsOptional()  
  @IsNumberString({}, { message: 'Skip must be a number' })
  skip?: number;
}