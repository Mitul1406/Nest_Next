import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { Budget } from './entities/budget.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { BudgetAlertInterceptor } from 'src/common/interceptors/budget-alert.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Expense])],
  controllers: [BudgetsController],
  providers: [BudgetsService,BudgetAlertInterceptor],
  exports: [BudgetsService],
})
export class BudgetsModule {}