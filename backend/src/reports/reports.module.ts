import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Expense } from '../expenses/entities/expense.entity';
import { Budget } from '../budgets/entities/budget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Budget])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}