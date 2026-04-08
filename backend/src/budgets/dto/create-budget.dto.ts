import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category!: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount!: number;

  @Type(() => Number)
  @IsInt({ message: 'Month must be an integer' })
  @Min(1, { message: 'Month must be between 1 and 12' })
  @Max(12, { message: 'Month must be between 1 and 12' })
  month!: number;

  @Type(() => Number)
  @IsInt({ message: 'Year must be an integer' })
  @Min(2000, { message: 'Year must be 2000 or later' })
  year!: number;
}